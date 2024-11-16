variable "location" {
  default = "northeurope"
}

variable "topic_or_queue_name" {
  default = "import_products_queue"
}

variable "docker_hub_username" {
  default = "steveneeson21"
}
variable "docker_hub_registry_name" {
  default = "steveneeson21"
}

variable "chatbot_container_name" {
  default = "chat_bot_app"
}

variable "chatbot_container_name_registry" {
  default = "myuniqchatbotacr"
}

variable "chatbot_container_tag_dh" {
  default = "v1"
}
