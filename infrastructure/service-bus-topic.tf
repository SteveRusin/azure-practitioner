# resource "azurerm_resource_group" "service_bus_rg" {
#   name     = "rg-service-bus-sand-ne-001"
#   location = var.location
# }
#
# resource "azurerm_servicebus_namespace" "service_bus" {
#   name                          = "sb-import-products"
#   location                      = azurerm_resource_group.service_bus_rg.location
#   resource_group_name           = azurerm_resource_group.service_bus_rg.name
#   sku                           = "Standard"
#   capacity                      = 0 /* standard for sku plan */
#   public_network_access_enabled = true /* can be changed to false for premium */
#   minimum_tls_version           = "1.2"
#   zone_redundant                = false /* can be changed to true for premium */
# }
#
# resource "azurerm_servicebus_topic" "import_products" {
#   name         = var.topic_or_queue_name
#   namespace_id = azurerm_servicebus_namespace.service_bus.id
#   status       = "Active"
# }
#
# resource "azurerm_servicebus_subscription" "sub_even" {
#   name               = "sub_even"
#   topic_id           = azurerm_servicebus_topic.import_products.id
#   max_delivery_count = 1
# }
#
# resource "azurerm_servicebus_subscription_rule" "even" {
#   name            = "tfex_servicebus_rule"
#   subscription_id = azurerm_servicebus_subscription.sub_even.id
#   filter_type     = "SqlFilter"
#
#   sql_filter = "index % 2 = 0" # Even numbers
# }
#
# resource "azurerm_servicebus_subscription" "sub_odd" {
#   name               = "sub_odd"
#   topic_id           = azurerm_servicebus_topic.import_products.id
#   max_delivery_count = 1
# }
#
# resource "azurerm_servicebus_subscription_rule" "odd" {
#   name            = "tfex_servicebus_rule"
#   subscription_id = azurerm_servicebus_subscription.sub_odd.id
#   filter_type     = "SqlFilter"
#
#   sql_filter = "index % 2 != 0" # Odd numbers
# }
