resource "azurerm_api_management" "function_api" {
  name                = "functionapi01"
  location            = azurerm_resource_group.product_service_rg.location
  resource_group_name = azurerm_resource_group.product_service_rg.name
  publisher_name      = "My Company"
  publisher_email     = "company@terraform.io"

  sku_name = "Developer_1"
}

resource "azurerm_api_management_api" "function_api" {
  name                  = "sandboxfuncappapim"
  resource_group_name   = azurerm_resource_group.product_service_rg.name
  api_management_name   = azurerm_api_management.function_api.name
  revision              = "1"
  path                  = "azurepractitioner"
  protocols             = ["https"]
  display_name          = "productsapi"
  subscription_required = false
}

resource "azurerm_api_management_policy" "global_policy" {
  api_management_id   = azurerm_api_management.function_api.id
  
  xml_content         = <<XML
  <policies>
    <inbound>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
          </allowed-origins>
        <allowed-methods preflight-result-max-age="300">
          <method>*</method>
          </allowed-methods>
        <allowed-headers>
          <header>*</header>
          </allowed-headers>
        <expose-headers>
          <header>*</header>
          </expose-headers>
        </cors>
    </inbound>
    <backend>
        <forward-request />
    </backend>
    <outbound />
    <on-error />
  </policies>
XML
}

// GET /products
resource "azurerm_api_management_api_operation" "get_products" {
  operation_id        = "get-products"
  api_name            = azurerm_api_management_api.function_api.name
  api_management_name = azurerm_api_management.function_api.name
  resource_group_name = azurerm_resource_group.product_service_rg.name
  display_name        = "Get Products"
  method              = "GET"
  url_template        = "/products"


  response {
    status_code = 200
    description = "Successful operation"
  }
}

resource "azurerm_api_management_api_operation_policy" "get_products_policy" {
  operation_id        = azurerm_api_management_api_operation.get_products.operation_id
  api_name            = azurerm_api_management_api.function_api.name
  api_management_name = azurerm_api_management.function_api.name
  resource_group_name = azurerm_resource_group.product_service_rg.name

  xml_content = <<XML
<policies>
    <inbound>
      <base />
      <set-backend-service base-url="https://fa-products-service-sand-ne-001.azurewebsites.net/api" />
    </inbound>
    <backend>
      <base />
    </backend>
    <outbound>
      <base />
    </outbound>
    <on-error>
      <base />
    </on-error>
  </policies>
XML
}

// GET /products/{id}
resource "azurerm_api_management_api_operation" "get_products_by_id" {
  operation_id        = "get-products-by-id"
  api_name            = azurerm_api_management_api.function_api.name
  api_management_name = azurerm_api_management.function_api.name
  resource_group_name = azurerm_resource_group.product_service_rg.name
  display_name        = "Get Products by id"
  method              = "GET"
  url_template        = "/products/{id}"

  template_parameter {
    name     = "id"
    type     = "string"
    required = true
  }

  response {
    status_code = 200
    description = "Successful operation"
  }
}

resource "azurerm_api_management_api_operation_policy" "get_products_by_id_policy" {
  operation_id        = azurerm_api_management_api_operation.get_products_by_id.operation_id
  api_name            = azurerm_api_management_api.function_api.name
  api_management_name = azurerm_api_management.function_api.name
  resource_group_name = azurerm_resource_group.product_service_rg.name

  xml_content = <<XML
<policies>
  <inbound>
    <base />
    <set-backend-service base-url="https://fa-products-service-sand-ne-001.azurewebsites.net/api" />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>
XML
}
