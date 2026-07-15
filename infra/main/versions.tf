terraform {
  required_version = ">= 1.7.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.11"
    }
  }

  # Terraform/OpenTofu state is stored in Cloudflare R2 (S3-compatible).
  # The bucket itself is created once by ./infra/bootstrap (see infra/README.md).
  #
  # Non-secret settings live here; the R2 access keys are injected at runtime
  # via env vars (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) so no credential
  # is ever committed. Locally, pass them via `tofu init -backend-config=...`
  # or environment; in CI they come from the GitHub Environment.
  backend "s3" {
    bucket = "voiceparty-tfstate"
    key    = "main/terraform.tfstate"
    region = "auto"

    # Replace <ACCOUNT_ID> with your Cloudflare account ID, or pass this whole
    # block via `-backend-config` at init time to keep it out of git if desired.
    endpoints = {
      s3 = "https://ded3682ef149b18dedb1e82650b1cda3.r2.cloudflarestorage.com"
    }

    # R2 is S3-compatible but not AWS; skip the AWS-specific probes.
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}
