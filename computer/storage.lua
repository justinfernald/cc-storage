-- Define the ItemDetails and other structures
local function getItemDetails(item)
  return {
    displayName = item.displayName,
    lore = item.lore or {},
    durability = item.durability or nil,
    maxCount = item.maxCount,
    maxDamage = item.maxDamage or nil,
    enchantments = item.enchantments or nil,
    tags = item.tags or {}
  }
end

-- Find all connected inventories and gather item details
local function findAllInventories()
  local inventories = {}
  peripheral.find("inventory", function(name, inventory)
    local size = #inventory.list()
    local itemStacks = {}

    for slot = 1, size do
      local item = inventory.getItemDetail(slot)
      if item then
        table.insert(itemStacks, {
          slot = slot,
          name = item.name,
          count = item.count,
          nbtHash = item.nbt or "",
          itemDetails = getItemDetails(item)
        })
      end
    end

    table.insert(inventories, {
      name = name,
      metaData = { size = size },
      itemStacks = itemStacks
    })
  end)
  return inventories
end

-- Gather inventory data and format as JSON
local function gatherInventoryData()
  local storages = findAllInventories()
  local inventoryUpdate = {
    storages = storages
  }

  local message = {
    type = "INVENTORY_UPDATE",
    data = inventoryUpdate
  }

  return textutils.serializeJSON(message)
end

-- Send JSON data over WebSocket
local function sendInventoryUpdate()
  local wsUrl = "ws://localhost:3000/ws"
  local ws, err = http.websocket(wsUrl)

  if not ws then
    print("Failed to connect to WebSocket: " .. err)
    return
  end

  local jsonString = gatherInventoryData()
  ws.send(jsonString)
  ws.close()
end

-- Example usage: send inventory update
sendInventoryUpdate()
