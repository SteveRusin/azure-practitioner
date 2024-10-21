resource "azurerm_resource_group" "import_service_rg" {
  location = var.location
  name     = "rg-import-service-sand-ne-001"
}

resource "azurerm_storage_account" "import_service_fa" {
  name     = "stgsangimportfane003"
  location = var.location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  access_tier                     = "Cool"
  enable_https_traffic_only       = true
  allow_nested_items_to_be_public = true
  shared_access_key_enabled       = true
  public_network_access_enabled   = true

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["PUT"]
      allowed_origins    = ["*"]
      max_age_in_seconds = 3600
      exposed_headers    = ["*"]
    }
  }

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_storage_container" "upload" {
  name                  = "upload"
  storage_account_name  = azurerm_storage_account.import_service_fa.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "parsed" {
  name                  = "parsed"
  storage_account_name  = azurerm_storage_account.import_service_fa.name
  container_access_type = "private"
}

resource "azurerm_storage_share" "import_service_fa" {
  name  = "fa-imports-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.import_service_fa.name
}

resource "azurerm_service_plan" "import_service_plan" {
  name     = "asp-import-service-sand-ne-001"
  location = var.location

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_application_insights" "import_service_fa" {
  name             = "appins-fa-imports-service-sand-ne-001"
  application_type = "web"
  location         = var.location


  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_windows_function_app" "imports_service" {
  name     = "fa-imports-service-sand-ne-001"
  location = var.location

  service_plan_id     = azurerm_service_plan.import_service_plan.id
  resource_group_name = azurerm_resource_group.import_service_rg.name

  storage_account_name       = azurerm_storage_account.import_service_fa.name
  storage_account_access_key = azurerm_storage_account.import_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.import_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.import_service_fa.connection_string

    use_32_bit_worker = true

    cors {
      allowed_origins = ["*"]
    }

    application_stack {
      node_version = "~18"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.import_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.import_service_fa.name
    FUNCTIONS_WORKER_RUNTIME                 = "node"
    DOTNET_USE_POLLING_FILE_WATCHER          = 1
    WEBSITE_RUN_FROM_PACKAGE                 = 1
    AZURE_STORAGE_ACCOUNT_NAME               = azurerm_storage_account.import_service_fa.name
    AZURE_STORAGE_KEY                        = azurerm_storage_account.import_service_fa.primary_access_key
  }

  lifecycle {
    ignore_changes = [
      site_config["application_stack"], // workaround for a bug when azure just "kills" your app
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}

