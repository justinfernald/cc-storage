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
      metaData = { size = #inventoryList },
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

  return textutils.serializeJSON(inventoryUpdate)
end

local previousInventoryData = nil

-- Send JSON data over WebSocket
local function sendInventoryUpdate(ws)
  local jsonString = gatherInventoryData()

  if jsonString == previousInventoryData then
    print("No changes in inventory data.")
    return
  end

  previousInventoryData = jsonString

  local chunkSize = 25000 -- 25KB

  local chunks = splitStringIntoChunks(jsonString, chunkSize)

  local transferId = randomString(10)

  for i, chunk in ipairs(chunks) do
    local message = {
      type = "STORAGE_SYSTEM_UPDATE",
      data = {
        partialStorageSystemMessage = chunk,
        updateTime = os.time(),
        transferId = transferId,
        chunkNumber = i,
        totalChunks = #chunks
      }
    }
    ws.send(textutils.serializeJSON(message))
  end

  -- ws.send(jsonString)
end

local function randomString(length)
  local chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  local randomString = ""
  for i = 1, length do
    local randomIndex = math.random(1, #chars)
    randomString = randomString .. chars:sub(randomIndex, randomIndex)
  end
  return randomString
end

-- Function that splits string into chunks
local function splitStringIntoChunks(str, chunkSize)
  local chunks = {}
  for i = 1, #str, chunkSize do
    table.insert(chunks, str:sub(i, i + chunkSize - 1))
  end
  return chunks
end

-- Send a ping message to the server
local function sendPingMessage(ws)
  local message = {
    type = "PING",
    data = {
      time = os.epoch("utc")
    }
  }
  ws.send(textutils.serializeJSON(message))
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
      name = computerName,
      type = "COMPUTER"
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

-- Function to maintain WebSocket connection
local function manageWebSocketConnection()
  while true do
    local ws, err = http.websocket(wsUrl)
    if ws then
      print("Connected to WebSocket.")
      sendConnectionMessage(ws)
      sendInventoryUpdate(ws)

      local function websocketHandler()
        while true do
          local success, event, url, message = pcall(os.pullEvent, "websocket_message")
          if success and url == wsUrl then
            local success, err = pcall(handleWebSocketMessage, ws, message)
            if not success then
              print("Error handling WebSocket message: " .. err)
            end
          elseif not success then
            print("Error pulling WebSocket message: " .. event) -- event contains the error message
          end
        end
      end

      local function periodicTasks()
        while true do
          local success, err = pcall(function()
            sendPingMessage(ws)
            sendInventoryUpdate(ws)
          end)
          if not success then
            print("Error during periodic tasks: " .. err)
          end
          sleep(15) -- Wait 15 seconds before the next update
        end
      end

      parallel.waitForAny(websocketHandler, periodicTasks)
    else
      print("Failed to connect to WebSocket: " .. err)
      sleep(5) -- Wait before retrying
    end
  end
end

-- Start WebSocket connection management
pcall(manageWebSocketConnection)
