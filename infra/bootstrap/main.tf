# Bootstrap: create the R2 bucket that stores the main module's Terraform state.
#
# Chicken-and-egg: this module's own state is tiny and kept LOCAL (committed
# nowhere — see .gitignore). Run it once:
#   cd infra/bootstrap
#   export CLOUDFLARE_API_TOKEN=...    # needs R2 edit
#   tofu init && tofu apply
# Then create an R2 API token (Access Key / Secret) in the dashboard for the
# main module's S3 backend, and proceed with infra/main.

terraform {
  required_version = ">= 1.7.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.11"
    }
  }
  # Local state on purpose. Do not commit terraform.tfstate (gitignored).
}

provider "cloudflare" {}

variable "account_id" {
  type        = string
  description = "Cloudflare account ID."
}

resource "cloudflare_r2_bucket" "tfstate" {
  account_id = var.account_id
  name       = "voiceparty-tfstate"
  location   = "APAC"
}

output "bucket_name" {
  value = cloudflare_r2_bucket.tfstate.name
}
