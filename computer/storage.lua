-- Get name of the computer on network as string
local computerName = os.getComputerLabel() or tostring(os.getComputerID())

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
    local inventoryList = inventory.list()
    local size = inventoryList
    local itemStacks = {}

    for slot, undetailedItem in pairs(inventoryList) do
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
    name = computerName,
    storages = storages
  }

  local message = {
    type = "STORAGE_SYSTEM_UPDATE",
    data = {
      updateTime = os.time(),
      storageSystem = inventoryUpdate
    }
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
        local quantity = move.quantity or itemDetail.count
        local toSlot = move.toSlot
        if toSlot == nil then
          fromInventory.pushItems(move.to, move.fromSlot, quantity)
        else
          fromInventory.pushItems(move.to, move.fromSlot, quantity, toSlot)
        end
      end
    end
  end
end

local function sendConnectionMessage(ws)
  local message = {
    type = "CONNECTION",
    data = {
      name = computerName
    }
  }
  ws.send(textutils.serializeJSON(message))
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

  sendConnectionMessage(ws)

  while true do
    local event, url, message = os.pullEvent("websocket_message")
    if url == wsUrl then
      handleWebSocketMessage(ws, message)
    end

    sleep(0.1)
  end
end

-- Start listening for WebSocket messages
listenWebSocket()
