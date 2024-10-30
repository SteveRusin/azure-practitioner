resource "azurerm_resource_group" "service_bus_rg" {
  name     = "rg-service-bus-sand-ne-001"
  location = var.location
}

resource "azurerm_servicebus_namespace" "service_bus" {
  name                          = "sb-import-products"
  location                      = azurerm_resource_group.service_bus_rg.location
  resource_group_name           = azurerm_resource_group.service_bus_rg.name
  sku                           = "Basic"
  capacity                      = 0 /* standard for sku plan */
  public_network_access_enabled = true /* can be changed to false for premium */
  minimum_tls_version           = "1.2"
  zone_redundant                = false /* can be changed to true for premium */
}

resource "azurerm_servicebus_queue" "import_products" {
  name                                    = var.topic_or_queue_name
  namespace_id                            = azurerm_servicebus_namespace.service_bus.id
  status                                  = "Active"
  enable_partitioning                     = true
  lock_duration                           = "PT1M" /* ISO 8601 timespan duration, 5 min is max */
  requires_duplicate_detection            = false
  duplicate_detection_history_time_window = "PT10M" /* ISO 8601 timespan duration, 5 min is max */
  requires_session                        = false
  dead_lettering_on_message_expiration    = false
}


