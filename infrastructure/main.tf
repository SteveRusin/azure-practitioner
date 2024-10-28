resource "azurerm_resource_group" "front_end_rg" {
  name     = "rg-frontend-sand-ne-001"
  location = var.location
}

resource "azurerm_storage_account" "front_end_storage_account" {
  name     = "sandboxfrontend01"
  location = var.location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  resource_group_name      = azurerm_resource_group.front_end_rg.name

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}

resource "azurerm_resource_group" "product_service_rg" {
  location = var.location
  name     = "rg-product-service-sand-ne-001"
}

resource "azurerm_storage_account" "products_service_fa" {
  name     = "stgsangproductsfane003"
  location = var.location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_storage_share" "products_service_fa" {
  name  = "fa-products-service-share"
  quota = 2

  storage_account_name = azurerm_storage_account.products_service_fa.name
}

resource "azurerm_service_plan" "product_service_plan" {
  name     = "asp-product-service-sand-ne-001"
  location = var.location

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_application_insights" "products_service_fa" {
  name             = "appins-fa-products-service-sand-ne-001"
  application_type = "web"
  location         = var.location


  resource_group_name = azurerm_resource_group.product_service_rg.name
}


resource "azurerm_windows_function_app" "products_service" {
  name     = "fa-products-service-sand-ne-001"
  location = var.location

  service_plan_id     = azurerm_service_plan.product_service_plan.id
  resource_group_name = azurerm_resource_group.product_service_rg.name

  storage_account_name       = azurerm_storage_account.products_service_fa.name
  storage_account_access_key = azurerm_storage_account.products_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.products_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.products_service_fa.connection_string

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
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.products_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.products_service_fa.name
    FUNCTIONS_WORKER_RUNTIME                 = "node"
    DB_URI                                   = azurerm_cosmosdb_account.products_account.endpoint
    DB_NAME                                  = azurerm_cosmosdb_sql_database.products_app.name
    DOTNET_USE_POLLING_FILE_WATCHER          = 1
    WEBSITE_RUN_FROM_PACKAGE                 = 1
    SB_CONNECTION_STRING                     = azurerm_servicebus_namespace.service_bus.default_primary_connection_string
    SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE        = azurerm_servicebus_queue.import_products.name
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

output "function_app_principal_id" {
  value = azurerm_windows_function_app.products_service.identity[0].principal_id
}

