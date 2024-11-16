resource "azurerm_resource_group" "app_service_rg" {
  name     = "rg-app-service-sand-ne-001"
  location = var.location
}

resource "azurerm_service_plan" "container_app" {
  name                = "containerappservplan"
  location            = azurerm_resource_group.app_service_rg.location
  resource_group_name = azurerm_resource_group.app_service_rg.name
  os_type             = "Windows"
  sku_name            = "B1"
}

resource "azurerm_windows_web_app" "container_app" {
  name                = "myuniqprefixcontainerappservice"
  location            = azurerm_resource_group.app_service_rg.location
  resource_group_name = azurerm_resource_group.app_service_rg.name
  service_plan_id     = azurerm_service_plan.container_app.id

  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "WEBSITE_NODE_DEFAULT_VERSION" = "20"
    "REDIRECT_TARGET" =  azurerm_container_app.chatbot_ca_docker_hub.ingress[0].fqdn
  }

  site_config {
    http2_enabled = true
  }
}
