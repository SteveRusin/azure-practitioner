resource "azurerm_role_definition" "custom_role" {
  name        = "cosmos-db-role"
  scope       = azurerm_cosmosdb_account.products_account.id
  description = "Role for cosmos db"

  permissions {
    actions = [
      "Microsoft.DocumentDB/databaseAccounts/read",
      "Microsoft.DocumentDB/databaseAccounts/listKeys/action",
      "Microsoft.DocumentDB/databaseAccounts/write"
    ]
    not_actions = []
  }

  assignable_scopes = [azurerm_cosmosdb_account.products_account.id]
}

resource "azurerm_role_assignment" "cosmosdb_access" {
  scope                = azurerm_cosmosdb_account.products_account.id
  role_definition_name = azurerm_role_definition.custom_role.name
  principal_id         = azurerm_windows_function_app.products_service.identity[0].principal_id
}

