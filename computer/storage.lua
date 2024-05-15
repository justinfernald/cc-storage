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
local function sendInventoryUpdate(ws)
  local jsonString = gatherInventoryData()
  ws.send(jsonString)
end

-- Move items between inventories
local function moveItems(moves)
  for _, move in ipairs(moves) do
    local fromInventory = peripheral.wrap(move.from)
    local toInventory = peripheral.wrap(move.to)
    if fromInventory and toInventory then
      local itemDetail = fromInventory.getItemDetail(move.fromSlot)
      if itemDetail then
        local toSlot = move.toSlot or toInventory.size() + 1
        fromInventory.pushItems(move.to, move.fromSlot, itemDetail.count, toSlot)
      end
    end
  end
end

-- WebSocket URL
local wsUrl = "ws://localhost:3000/ws" -- Replace with your WebSocket URL

-- Function to handle incoming WebSocket messages
local function handleWebSocketMessage(ws, message)
  print("Received message: " .. message)

  local parsedMessage = textutils.unserializeJSON(message)
  if parsedMessage.type == "FETCH_UPDATE" then
    sendInventoryUpdate(ws)
  elseif parsedMessage.type == "MOVE_ITEMS" then
    moveItems(parsedMessage.data.moves)
  end
end

-- Establish WebSocket connection and listen for messages
local function listenWebSocket()
  local ws, err = http.websocket(wsUrl)
  if not ws then
    print("Failed to connect to WebSocket: " .. err)
    return
  end

  while true do
    local event, url, message = os.pullEvent("websocket_message")
    if url == wsUrl then
      handleWebSocketMessage(ws, message)
    end

    sleep(1)
  end
end

-- Start listening for WebSocket messages
listenWebSocket()
