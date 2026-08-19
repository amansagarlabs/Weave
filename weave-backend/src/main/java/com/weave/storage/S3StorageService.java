package com.weave.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.BucketExistsArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.Map;
import java.util.UUID;

@Service
public class S3StorageService {
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4");
    private final String endpoint;
    private final String provider;
    private final String bucket;
    private final String publicBaseUrl;
    private final long maxUploadBytes;
    private final MinioClient client;
    private final Cloudinary cloudinary;

    public S3StorageService(
            @Value("${weave.storage.s3.endpoint:}") String endpoint,
            @Value("${weave.storage.provider:s3}") String provider,
            @Value("${weave.storage.s3.region:auto}") String region,
            @Value("${weave.storage.s3.bucket:}") String bucket,
            @Value("${weave.storage.s3.access-key:}") String accessKey,
            @Value("${weave.storage.s3.secret-key:}") String secretKey,
            @Value("${weave.storage.s3.public-base-url:}") String publicBaseUrl,
            @Value("${weave.storage.s3.max-upload-bytes:26214400}") long maxUploadBytes
    ) {
        this.endpoint = endpoint;
        this.provider = provider.trim().toLowerCase();
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
        this.maxUploadBytes = maxUploadBytes;
        if (endpoint.isBlank()) {
            this.client = null;
        } else {
            MinioClient.Builder builder = MinioClient.builder().endpoint(endpoint).region(region);
            if (!accessKey.isBlank() && !secretKey.isBlank()) builder.credentials(accessKey, secretKey);
            this.client = builder.build();
        }
        String cloudName = System.getenv().getOrDefault("CLOUDINARY_CLOUD_NAME", "");
        String apiKey = System.getenv().getOrDefault("CLOUDINARY_API_KEY", "");
        String apiSecret = System.getenv().getOrDefault("CLOUDINARY_API_SECRET", "");
        this.cloudinary = cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()
                ? null : new Cloudinary(ObjectUtils.asMap("cloud_name", cloudName, "api_key", apiKey, "api_secret", apiSecret));
    }

    public StoredAsset upload(MultipartFile file, String namespace) {
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_TYPES.contains(contentType)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported asset type");
        if (file.isEmpty() || file.getSize() > maxUploadBytes) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Asset is empty or exceeds the upload limit");
        if ("cloudinary".equals(provider)) return uploadCloudinary(file, namespace, contentType);
        if (endpoint.isBlank() || bucket.isBlank() || client == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "S3-compatible storage is not configured");
        String object = namespace + "/" + UUID.randomUUID() + "-" + safeName(file.getOriginalFilename());
        try {
            client.putObject(PutObjectArgs.builder().bucket(bucket).object(object).stream(file.getInputStream(), file.getSize(), -1).contentType(contentType).build());
            if (publicBaseUrl.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "S3_PUBLIC_BASE_URL is not configured");
            return StoredAsset.legacy(publicBaseUrl + "/" + object);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Asset upload failed");
        }
    }

    public boolean isHealthy() {
        if ("cloudinary".equals(provider)) return cloudinary != null;
        if (endpoint.isBlank() || bucket.isBlank() || client == null) return false;
        try {
            return client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        } catch (Exception exception) {
            return false;
        }
    }

    public void delete(String assetUrl) {
        if ("cloudinary".equals(provider) || client == null || assetUrl == null || publicBaseUrl.isBlank() || !assetUrl.startsWith(publicBaseUrl + "/")) return;
        String object = assetUrl.substring((publicBaseUrl + "/").length());
        try {
            client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(object).build());
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stored portfolio file could not be removed");
        }
    }

    private StoredAsset uploadCloudinary(MultipartFile file, String namespace, String contentType) {
        if (cloudinary == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Cloudinary storage is not configured");
        String resourceType = contentType.startsWith("video/") ? "video" : contentType.equals("application/pdf") ? "raw" : "image";
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", resourceType,
                    "folder", namespace,
                    "type", "authenticated",
                    "use_filename", false,
                    "unique_filename", true,
                    "overwrite", false,
                    "secure", true));
            Object publicId = result.get("public_id");
            Object version = result.get("version");
            Object format = result.get("format");
            Object returnedType = result.get("resource_type");
            if (publicId == null || version == null || format == null || returnedType == null) throw new IllegalStateException("Cloudinary returned incomplete asset metadata");
            return StoredAsset.cloudinary(publicId.toString(), returnedType.toString(), format.toString(), Long.valueOf(version.toString()));
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary upload failed");
        }
    }

    public String deliveryUrl(String legacyUrl, String publicId, String resourceType, String format, Long version) {
        if (publicId == null || resourceType == null || format == null || version == null) {
            if ("cloudinary".equals(provider)) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Asset signing metadata is unavailable");
            }
            return legacyUrl;
        }
        if (cloudinary == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Cloudinary storage is not configured");
        return cloudinary.url().secure(true).resourceType(resourceType).type("authenticated").version(version.toString())
                .format(format).signed(true).generate(publicId);
    }

    private String safeName(String original) {
        String name = original == null ? "asset" : original.replaceAll("[^a-zA-Z0-9._-]", "-");
        return name.length() > 80 ? name.substring(name.length() - 80) : name;
    }
}
