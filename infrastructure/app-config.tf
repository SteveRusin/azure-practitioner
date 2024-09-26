resource "azurerm_app_configuration" "app_config" {
  name                = "reallyuniqnameforfunctionapp1234"
  resource_group_name = azurerm_resource_group.front_end_rg.name
  location            = "northeurope"
}
