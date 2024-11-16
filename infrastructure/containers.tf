resource "azurerm_resource_group" "acr_rg" {
  name     = "rg-acr-sand-ne-001"
  location = var.location
}


resource "azurerm_container_registry" "acr" {
  name                = "myuniqchatbotacr"
  resource_group_name = azurerm_resource_group.acr_rg.name
  location            = azurerm_resource_group.acr_rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_log_analytics_workspace" "acr_log_analytics_workspace" {
  name                = "acr-log-analytics-workspace"
  resource_group_name = azurerm_resource_group.acr_rg.name
  location            = azurerm_resource_group.acr_rg.location
}

resource "azurerm_container_app_environment" "chatbot_cae" {
  name                       = "myuniqprefix-cae-chatbot-001"
  resource_group_name        = azurerm_resource_group.acr_rg.name
  location                   = azurerm_resource_group.acr_rg.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.acr_log_analytics_workspace.id
}

resource "azurerm_container_app" "chatbot_ca_docker_hub" {
  name                         = "myuniqprefix-chatbot-ca-dh-003"
  container_app_environment_id = azurerm_container_app_environment.chatbot_cae.id
  resource_group_name          = azurerm_resource_group.acr_rg.name
  revision_mode                = "Single"

  registry {
    server               = "docker.io"
    username             = var.docker_hub_username
    password_secret_name = "docker-io-pass"
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }

  }

  template {
    container {
      name   = "myuniqprefix-chatbot-container-dh"
      image  = "${var.docker_hub_registry_name}/${var.chatbot_container_name}:${var.chatbot_container_tag_dh}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "CONTAINER_REGISTRY_NAME"
        value = "Docker Hub"
      }
    }
  }

  secret {
    name  = "docker-io-pass"
    value = var.docker_hub_password
  }
}

resource "azurerm_container_app" "chatbot_ca_docker_acr" {
  name                         = "myuniqprefix-chatbot-ca-acr-001"
  container_app_environment_id = azurerm_container_app_environment.chatbot_cae.id
  resource_group_name          = azurerm_resource_group.acr_rg.name
  revision_mode                = "Single"

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }

  }

  template {
    container {
      name   = "my-uniq-prefix-chatbot-container-acr"
      image  = "${azurerm_container_registry.acr.login_server}/${var.chatbot_container_name_registry}:${var.chatbot_container_tag_dh}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "CONTAINER_REGISTRY_NAME"
        value = "Azure Container Registry"
      }
    }
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }
}
