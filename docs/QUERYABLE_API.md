# Queryable API Documentation

**Version:** 2.2.0
**Last Updated:** January 4, 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Why Use Queryable API?](#why-use-queryable-api)
3. [Core Concepts](#core-concepts)
4. [Getting Started](#getting-started)
5. [Available Queryables](#available-queryables)
6. [API Reference](#api-reference)
7. [Common Patterns](#common-patterns)
8. [Advanced Usage](#advanced-usage)
9. [Performance Tips](#performance-tips)
10. [Threading](#threading)
11. [Migration Guide](#migration-guide)

---

## Introduction

The **Queryable API** is a modern, fluent interface for querying game entities in Microbot. It provides a type-safe, chainable way to filter and find NPCs, players, ground items, and tile objects with minimal boilerplate code.

### Design Philosophy

- **Fluent Interface**: Chain multiple filters for readable code
- **Type-Safe**: Compile-time checking prevents errors
- **Performance**: Leverages efficient caching and streaming
- **Dependency Injection**: Cache-first architecture for optimal performance
- **Intuitive**: Natural language-like queries
- **Flexible**: Custom predicates for complex filters

---

## Why Use Queryable API?

### Old Way (Legacy) ❌

```java
// Verbose and hard to read
NPC banker = null;
for (NPC npc : client.getNpcs()) {
    if (npc.getName() != null &&
        npc.getName().equals("Banker") &&
        !npc.getInteracting() != null) {
        if (banker == null ||
            npc.getWorldLocation().distanceTo(player.getWorldLocation()) <
            banker.getWorldLocation().distanceTo(player.getWorldLocation())) {
            banker = npc;
        }
    }
}

// Stream API - better but still verbose
NPC banker = Rs2Npc.getNpcs().stream()
    .filter(npc -> npc.getName() != null)
    .filter(npc -> npc.getName().equals("Banker"))
    .filter(npc -> npc.getInteracting() == null)
    .min(Comparator.comparingInt(npc ->
        npc.getWorldLocation().distanceTo(player.getWorldLocation())))
    .orElse(null);
```

### New Way (Queryable) ✅

```java
// First, inject the cache in your class
@Inject
Rs2NpcCache rs2NpcCache;

// Then use the fluent query API
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .where(npc -> !npc.isInteracting())
    .nearest();
```

**Benefits:**
- 📖 **Readable**: Self-documenting code
- 🚀 **Faster Development**: Less code to write
- 🐛 **Fewer Bugs**: Type-safe operations
- 🔧 **Maintainable**: Easy to modify queries
- ⚡ **Performant**: Cache-first architecture
- 💉 **Dependency Injection**: Proper separation of concerns

---

## Core Concepts

### 1. Dependency Injection (Cache-First)

The Queryable API uses dependency injection to provide cache instances. Always inject the cache first, then call `query()` to get the queryable:

```java
// Inject the cache in your plugin/script class
@Inject
Rs2NpcCache rs2NpcCache;

@Inject
Rs2TileItemCache rs2TileItemCache;

@Inject
Rs2PlayerCache rs2PlayerCache;

@Inject
Rs2TileObjectCache rs2TileObjectCache;
```

### 2. Entity Models

All queryable entities implement the `IEntity` interface:

```java
public interface IEntity {
    String getName();           // Entity name
    int getId();               // Entity ID
    WorldPoint getWorldLocation(); // World coordinates
    // ... other common properties
}
```

**Available Models:**
- `Rs2NpcModel` - NPCs
- `Rs2PlayerModel` - Players
- `Rs2TileItemModel` - Ground items
- `Rs2TileObjectModel` - Game objects

### 3. Queryable Interface

All queryables implement `IEntityQueryable<Q, E>`:

```java
public interface IEntityQueryable<Q, E> {
    Q where(Predicate<E> predicate);     // Custom filter
    Q within(int distance);               // Distance from player
    Q within(WorldPoint anchor, int distance); // Distance from point
    E first();                            // First match
    E firstOnClientThread();              // First match (client thread safe)
    E nearest();                          // Nearest to player
    E nearestOnClientThread();            // Nearest to player (client thread safe)
    E nearest(int maxDistance);           // Nearest within range
    E nearest(WorldPoint anchor, int maxDistance); // Nearest to point
    E withName(String name);             // Find by name (requires client thread)
    E withNames(String... names);        // Find by multiple names (requires client thread)
    E withId(int id);                    // Find by ID
    E withIds(int... ids);               // Find by multiple IDs
    List<E> toList();                    // Get all matches
}
```

> **Note:** When using `withName()` or `withNames()`, always use `firstOnClientThread()` or `nearestOnClientThread()` as the terminal operation. See [Threading](#threading) for details.

### 4. Fluent Chaining

Methods return the queryable itself, allowing chaining:

```java
rs2NpcCache.query()
    .withName("Guard")           // Filter by name
    .where(npc -> !npc.isInteracting())  // Add custom filter
    .within(15)                  // Within 15 tiles
    .nearest();                  // Get nearest match
```

### 5. Lazy Evaluation

Queries are not executed until a terminal operation is called:

```java
// No execution yet - just building the query
var query = rs2NpcCache.query()
    .withName("Guard")
    .within(10);

// NOW it executes
Rs2NpcModel guard = query.nearest();  // Terminal operation
```

---

## Getting Started

### Step 1: Inject the Caches

First, inject the cache(s) you need in your plugin or script class:

```java
public class MyPlugin extends Plugin {
    @Inject
    Rs2NpcCache rs2NpcCache;

    @Inject
    Rs2TileItemCache rs2TileItemCache;

    @Inject
    Rs2PlayerCache rs2PlayerCache;

    @Inject
    Rs2TileObjectCache rs2TileObjectCache;
}
```

### Step 2: Query Pattern

Every query follows this pattern:

```java
// 1. Access the queryable via cache.query()
rs2NpcCache.query()

// 2. Add filters (optional, chainable)
    .withName("name")
    .where(entity -> condition)
    .within(distance)

// 3. Execute with terminal operation
    .nearest();  // or first(), toList(), etc.
```

### Simple Examples

**Find nearest NPC by name:**
```java
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .nearest();
```

**Find nearest ground item:**
```java
Rs2TileItemModel coins = rs2TileItemCache.query()
    .withName("Coins")
    .nearest();
```

**Find nearest player:**
```java
Rs2PlayerModel player = rs2PlayerCache.query()
    .withName("PlayerName")
    .nearest();
```

**Find nearest tree (tile object):**
```java
Rs2TileObjectModel tree = rs2TileObjectCache.query()
    .withName("Tree")
    .nearest();
```

---

## Available Queryables

### 1. Rs2NpcCache - NPC Queries

**Injection & Import:**
```java
import net.runelite.client.plugins.microbot.api.npc.Rs2NpcCache;
import net.runelite.client.plugins.microbot.api.npc.models.Rs2NpcModel;

@Inject
Rs2NpcCache rs2NpcCache;
```

**Basic Usage:**
```java
// Find nearest banker
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .nearest();

// Find all guards within 10 tiles
List<Rs2NpcModel> guards = rs2NpcCache.query()
    .withName("Guard")
    .within(10)
    .toList();

// Find nearest non-interacting cow
Rs2NpcModel cow = rs2NpcCache.query()
    .withName("Cow")
    .where(npc -> !npc.isInteracting())
    .nearest();
```

**Rs2NpcModel Methods:**
```java
npc.getName()              // "Guard"
npc.getId()                // 123
npc.getWorldLocation()     // WorldPoint
npc.isInteracting()        // true/false
npc.getHealthRatio()       // 0-30
npc.getAnimation()         // Animation ID
npc.click("Attack")        // Interact with NPC
npc.interact("Bank")       // Alternative interact method
```

### 2. Rs2TileItemCache - Ground Item Queries

**Injection & Import:**
```java
import net.runelite.client.plugins.microbot.api.tileitem.Rs2TileItemCache;
import net.runelite.client.plugins.microbot.api.tileitem.models.Rs2TileItemModel;

@Inject
Rs2TileItemCache rs2TileItemCache;
```

**Basic Usage:**
```java
// Find nearest coins
Rs2TileItemModel coins = rs2TileItemCache.query()
    .withName("Coins")
    .nearest();

// Find valuable items
List<Rs2TileItemModel> loot = rs2TileItemCache.query()
    .where(item -> item.getTotalValue() > 1000)
    .toList();

// Find nearest lootable item
Rs2TileItemModel lootable = rs2TileItemCache.query()
    .where(Rs2TileItemModel::isLootAble)
    .nearest();
```

**Rs2TileItemModel Methods:**
```java
item.getName()             // "Coins"
item.getId()               // Item ID
item.getQuantity()         // Stack size
item.getTotalValue()       // GE value
item.getTotalGeValue()     // Total GE value
item.isLootAble()          // Can loot?
item.isOwned()             // Owned by player?
item.isStackable()         // Is stackable?
item.isNoted()             // Is noted?
item.isTradeable()         // Is tradeable?
item.isMembers()           // Members item?
item.isDespawned()         // Has despawned?
item.willDespawnWithin(seconds) // Will despawn soon?
item.pickup()              // Pick up item
```

### 3. Rs2PlayerCache - Player Queries

**Injection & Import:**
```java
import net.runelite.client.plugins.microbot.api.player.Rs2PlayerCache;
import net.runelite.client.plugins.microbot.api.player.models.Rs2PlayerModel;

@Inject
Rs2PlayerCache rs2PlayerCache;
```

**Basic Usage:**
```java
// Find nearest player
Rs2PlayerModel player = rs2PlayerCache.query()
    .nearest();

// Find player by name
Rs2PlayerModel target = rs2PlayerCache.query()
    .withName("PlayerName")
    .nearest();

// Find all friends nearby
List<Rs2PlayerModel> friends = rs2PlayerCache.query()
    .where(Rs2PlayerModel::isFriend)
    .within(20)
    .toList();
```

**Rs2PlayerModel Methods:**
```java
player.getName()           // Player name
player.getCombatLevel()    // Combat level
player.getHealthRatio()    // Health (-1 if not visible)
player.isFriend()          // Is friend?
player.isClanMember()      // In your clan?
player.isFriendsChatMember() // In friends chat?
player.getSkullIcon()      // Skull icon (-1 if none)
player.getOverheadIcon()   // Prayer icon
player.getAnimation()      // Current animation
player.isInteracting()     // Is interacting?
```

### 4. Rs2TileObjectCache - Tile Object Queries

**Injection & Import:**
```java
import net.runelite.client.plugins.microbot.api.tileobject.Rs2TileObjectCache;
import net.runelite.client.plugins.microbot.api.tileobject.models.Rs2TileObjectModel;

@Inject
Rs2TileObjectCache rs2TileObjectCache;
```

**Basic Usage:**
```java
// Find nearest tree
Rs2TileObjectModel tree = rs2TileObjectCache.query()
    .withName("Tree")
    .nearest();

// Find nearest bank booth
Rs2TileObjectModel bank = rs2TileObjectCache.query()
    .withName("Bank booth")
    .nearest();

// Find all rocks within 15 tiles
List<Rs2TileObjectModel> rocks = rs2TileObjectCache.query()
    .where(obj -> obj.getName() != null &&
                  obj.getName().contains("rocks"))
    .within(15)
    .toList();
```

**Rs2TileObjectModel Methods:**
```java
obj.getName()              // "Tree"
obj.getId()                // Object ID
obj.getWorldLocation()     // WorldPoint
obj.click("Chop down")     // Interact with object
obj.interact("Mine")       // Alternative interact
```

---

## API Reference

### Terminal Operations

These execute the query and return results:

#### `nearest()`
Returns the nearest entity to the player.

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .nearest();
```

#### `nearest(int maxDistance)`
Returns the nearest entity within max distance from player.

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .nearest(10);  // Within 10 tiles
```

#### `nearest(WorldPoint anchor, int maxDistance)`
Returns the nearest entity to a specific point.

```java
WorldPoint location = new WorldPoint(3100, 3500, 0);
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .nearest(location, 5);
```

#### `first()`
Returns the first matching entity (not necessarily nearest).

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withId(NpcID.GUARD)
    .first();
```

#### `firstOnClientThread()`
Returns the first matching entity, executing the query on the client thread. **Required when using `withName()` or `withNames()`**.

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .firstOnClientThread();
```

#### `nearestOnClientThread()`
Returns the nearest entity to the player, executing the query on the client thread. **Required when using `withName()` or `withNames()`**.

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .nearestOnClientThread();
```

#### `withName(String name)`
Finds nearest entity with exact name (case-insensitive).

> ⚠️ **Client Thread Required:** This method accesses widget data. Use `nearestOnClientThread()` or `firstOnClientThread()` instead, or wrap in `Microbot.getClientThread().invoke()`. See [Threading](#threading).

```java
// ✅ Recommended - uses client thread variant
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .nearestOnClientThread();

// Alternative - manual client thread invocation
Rs2NpcModel banker = Microbot.getClientThread().invoke(() ->
    rs2NpcCache.query()
        .withName("Banker")
        .nearest()
);
```

#### `withNames(String... names)`
Finds nearest entity matching any of the names.

> ⚠️ **Client Thread Required:** This method accesses widget data. Use `nearestOnClientThread()` or `firstOnClientThread()` instead, or wrap in `Microbot.getClientThread().invoke()`. See [Threading](#threading).

```java
// ✅ Recommended - uses client thread variant
Rs2NpcModel npc = rs2NpcCache.query()
    .withNames("Banker", "Bank clerk", "Bank assistant")
    .nearestOnClientThread();
```

#### `withId(int id)`
Finds nearest entity with specific ID.

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withId(1234);
```

#### `withIds(int... ids)`
Finds nearest entity matching any of the IDs.

```java
Rs2NpcModel npc = rs2NpcCache.query()
    .withIds(1234, 5678, 9012);
```

#### `toList()`
Returns all matching entities as a list.

```java
List<Rs2NpcModel> guards = rs2NpcCache.query()
    .withName("Guard")
    .toList();
```

### Filter Operations

These filter entities and return the queryable for chaining:

#### `where(Predicate<E> predicate)`
Adds a custom filter using a lambda expression.

```java
rs2NpcCache.query()
    .where(npc -> npc.getHealthRatio() > 0)
    .where(npc -> !npc.isInteracting())
    .nearest();
```

#### `within(int distance)`
Filters entities within distance from player.

```java
rs2NpcCache.query()
    .withName("Guard")
    .within(10)
    .toList();
```

#### `within(WorldPoint anchor, int distance)`
Filters entities within distance from a specific point.

```java
WorldPoint location = new WorldPoint(3100, 3500, 0);
rs2NpcCache.query()
    .withName("Guard")
    .within(location, 15)
    .toList();
```

---

## Common Patterns

### Pattern 1: Find Nearest Non-Interacting NPC

```java
Rs2NpcModel cow = rs2NpcCache.query()
    .withName("Cow")
    .where(npc -> !npc.isInteracting())
    .nearest();

if (cow != null) {
    cow.click("Attack");
}
```

### Pattern 2: Find Valuable Loot

```java
Rs2TileItemModel loot = rs2TileItemCache.query()
    .where(item -> item.getTotalGeValue() >= 5000)
    .where(Rs2TileItemModel::isLootAble)
    .nearest(10);

if (loot != null) {
    loot.pickup();
}
```

### Pattern 3: Find Multiple NPCs

```java
List<Rs2NpcModel> guards = rs2NpcCache.query()
    .withName("Guard")
    .where(npc -> !npc.isInteracting())
    .within(15)
    .toList();

for (Rs2NpcModel guard : guards) {
    // Do something with each guard
}
```

### Pattern 4: Find by Multiple Names

```java
Rs2NpcModel banker = rs2NpcCache.query()
    .withNames("Banker", "Bank clerk", "Bank assistant");

if (banker != null) {
    banker.click("Bank");
}
```

### Pattern 5: Complex Query with Multiple Filters

```java
Rs2NpcModel target = rs2NpcCache.query()
    .withName("Goblin")
    .where(npc -> !npc.isInteracting())
    .where(npc -> npc.getHealthRatio() > 0)
    .where(npc -> npc.getAnimation() == -1)  // Not animating
    .within(10)
    .nearest();
```

### Pattern 6: Find Nearest Object by Partial Name

```java
Rs2TileObjectModel tree = rs2TileObjectCache.query()
    .where(obj -> obj.getName() != null &&
                  obj.getName().toLowerCase().contains("tree"))
    .nearest();
```

### Pattern 7: Find Items About to Despawn

```java
List<Rs2TileItemModel> despawning = rs2TileItemCache.query()
    .where(item -> item.willDespawnWithin(30))  // 30 seconds
    .where(item -> item.getTotalValue() > 1000)
    .toList();
```

### Pattern 8: Find Friends Nearby

```java
List<Rs2PlayerModel> friends = rs2PlayerCache.query()
    .where(Rs2PlayerModel::isFriend)
    .within(20)
    .toList();
```

### Pattern 9: Find Low Health Enemies

```java
Rs2NpcModel weakEnemy = rs2NpcCache.query()
    .withName("Goblin")
    .where(npc -> npc.getHealthRatio() > 0 &&
                  npc.getHealthRatio() < 10)  // Low health
    .nearest();
```

### Pattern 10: Find Specific Object by ID

```java
Rs2TileObjectModel altar = rs2TileObjectCache.query()
    .withId(409)  // Altar object ID
    .nearest();
```

---

## Advanced Usage

### Custom Predicates

Create reusable predicates for common filters:

```java
@Inject
Rs2NpcCache rs2NpcCache;

// Define predicates
Predicate<Rs2NpcModel> isAlive = npc -> npc.getHealthRatio() > 0;
Predicate<Rs2NpcModel> notBusy = npc -> !npc.isInteracting();
Predicate<Rs2NpcModel> notAnimating = npc -> npc.getAnimation() == -1;

// Use them
Rs2NpcModel target = rs2NpcCache.query()
    .withName("Cow")
    .where(isAlive)
    .where(notBusy)
    .where(notAnimating)
    .nearest();
```

### Combining Predicates

```java
@Inject
Rs2NpcCache rs2NpcCache;

@Inject
Rs2TileItemCache rs2TileItemCache;

// Combine with AND
Predicate<Rs2NpcModel> attackable =
    npc -> !npc.isInteracting() && npc.getHealthRatio() > 0;

Rs2NpcModel target = rs2NpcCache.query()
    .withName("Goblin")
    .where(attackable)
    .nearest();

// Combine with OR
Predicate<Rs2TileItemModel> valuableOrStackable =
    item -> item.getTotalValue() > 1000 || item.isStackable();

Rs2TileItemModel loot = rs2TileItemCache.query()
    .where(valuableOrStackable)
    .nearest();
```

### Distance-Based Queries

```java
@Inject
Rs2NpcCache rs2NpcCache;

// Find nearest NPC within specific range
WorldPoint homeBase = new WorldPoint(3100, 3500, 0);

Rs2NpcModel nearbyEnemy = rs2NpcCache.query()
    .withName("Goblin")
    .within(homeBase, 10)  // Within 10 tiles of home base
    .nearest(homeBase, 10);  // Get nearest to home base
```

### Sorting and Limiting

```java
@Inject
Rs2NpcCache rs2NpcCache;

// Get 5 nearest guards
List<Rs2NpcModel> guards = rs2NpcCache.query()
    .withName("Guard")
    .toList()
    .stream()
    .sorted(Comparator.comparingInt(npc ->
        npc.getWorldLocation().distanceTo(Rs2Player.getWorldLocation())))
    .limit(5)
    .collect(Collectors.toList());
```

### Null Safety

Always check for null results:

```java
@Inject
Rs2NpcCache rs2NpcCache;

Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .nearest();

if (banker != null) {
    banker.click("Bank");
} else {
    log.warn("No banker found nearby");
}
```

### Using with sleepUntil

```java
@Inject
Rs2NpcCache rs2NpcCache;

// Wait until target NPC appears
Rs2NpcModel target = sleepUntilNotNull(() ->
    rs2NpcCache.query()
        .withName("Banker")
        .nearest(),
    5000, 600  // 5 second timeout, check every 600ms
);

if (target != null) {
    target.click("Bank");
}
```

---

## Performance Tips

### ✅ DO:

**1. Use specific filters early:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

// Good - filters by name first
rs2NpcCache.query()
    .withName("Guard")
    .where(npc -> !npc.isInteracting())
    .nearest();
```

**2. Limit search radius:**
```java
// Good - only searches within 10 tiles
rs2NpcCache.query()
    .withName("Guard")
    .within(10)
    .nearest();
```

**3. Cache results when possible:**
```java
// Good - query once, use multiple times
List<Rs2NpcModel> guards = rs2NpcCache.query()
    .withName("Guard")
    .toList();

for (Rs2NpcModel guard : guards) {
    // Process each guard
}
```

**4. Use method references:**
```java
@Inject
Rs2TileItemCache rs2TileItemCache;

// Good - cleaner and potentially faster
rs2TileItemCache.query()
    .where(Rs2TileItemModel::isLootAble)
    .nearest();
```

### ❌ DON'T:

**1. Don't query in tight loops:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

// Bad - queries on every iteration
while (true) {
    Rs2NpcModel npc = rs2NpcCache.query()
        .withName("Guard")
        .nearest();
    // ...
    sleep(100);  // Still too frequent
}

// Good - reasonable interval
while (true) {
    Rs2NpcModel npc = rs2NpcCache.query()
        .withName("Guard")
        .nearest();
    // ...
    sleep(600);  // ~1 game tick
}
```

**2. Don't use expensive operations in predicates:**
```java
// Bad - calls API repeatedly in filter
rs2NpcCache.query()
    .where(npc -> someExpensiveApiCall(npc))
    .nearest();

// Good - call API once, cache result
boolean shouldFilter = someExpensiveApiCall();
rs2NpcCache.query()
    .where(npc -> shouldFilter)
    .nearest();
```

**3. Don't create unnecessary lists:**
```java
// Bad - creates full list just to get one item
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .toList()
    .get(0);

// Good - gets first directly
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Guard")
    .first();
```

---

## Threading

Scripts run on a scheduled executor thread, but certain RuneLite API calls (widgets, game objects, etc.) must run on the client thread. This is particularly important when using **name-based queries**.

### Client Thread Requirement for Name Queries

Queries that use `withName()` or `withNames()` internally access widget data and other client-thread-only resources. To safely execute these queries, use the client thread variants:

- **`firstOnClientThread()`** - Returns the first matching entity (runs on client thread)
- **`nearestOnClientThread()`** - Returns the nearest matching entity (runs on client thread)

**Example:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

// ❌ WRONG - May throw "must be called on client thread" error
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .nearest();

// ✅ CORRECT - Runs the query on the client thread
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .nearestOnClientThread();

// ✅ CORRECT - Using first variant
Rs2NpcModel banker = rs2NpcCache.query()
    .withName("Banker")
    .firstOnClientThread();
```

### When to Use Client Thread Methods

Use `firstOnClientThread()` or `nearestOnClientThread()` when your query includes:
- `.withName(String name)` - filters by entity name
- `.withNames(String... names)` - filters by multiple entity names

These methods internally access widgets and other client-thread-only resources.

### Manual Client Thread Invocation

For more complex scenarios or when you need to perform multiple client-thread operations, use `Microbot.getClientThread().invoke()`:

```java
// For operations that return a value
Rs2NpcModel banker = Microbot.getClientThread().invoke(() -> 
    rs2NpcCache.query()
        .withName("Banker")
        .nearest()
);

// For void operations
Microbot.getClientThread().invoke(() -> {
    // Multiple client thread operations here
    Rs2NpcModel npc = rs2NpcCache.query().withName("Guard").nearest();
    if (npc != null) {
        npc.click("Attack");
    }
});
```

### Other Client Thread Operations

Beyond the Queryable API, always use `Microbot.getClientThread().invoke()` when accessing:
- Widgets (`client.getWidget()`, `widget.isHidden()`)
- Game objects that aren't cached
- Player world view (`client.getLocalPlayer().getWorldView()`)
- Varbits (`client.getVarbitValue()`)
- `BoatLocation.fromLocal()` - accesses player world view internally
- `TrialInfo.getCurrent()` - accesses widgets internally
- `Rs2BoatCache.getLocalBoat()` - accesses player world view
- `Rs2BoatModel.isNavigating()` - accesses varbits
- `Rs2BoatModel.isMovingForward()` - accesses varbits
- `Rs2BoatModel.getHeading()` - accesses varbits
- Any RuneLite API that throws "must be called on client thread"

---

## Migration Guide

### From Legacy API to Queryable API

#### Step 0: Inject the Caches

First, add cache injections to your class:

```java
@Inject
Rs2NpcCache rs2NpcCache;

@Inject
Rs2TileItemCache rs2TileItemCache;

@Inject
Rs2TileObjectCache rs2TileObjectCache;
```

#### NPCs

**Legacy:**
```java
// Old way
NPC npc = Rs2Npc.getNpc("Banker");
NPC nearest = Rs2Npc.getNearestNpc("Guard");
List<NPC> npcs = Rs2Npc.getNpcs(NpcID.GUARD);
```

**Queryable:**
```java
// New way - using injected cache
Rs2NpcModel npc = rs2NpcCache.query()
    .withName("Banker");

Rs2NpcModel nearest = rs2NpcCache.query()
    .withName("Guard")
    .nearest();

List<Rs2NpcModel> npcs = rs2NpcCache.query()
    .withId(NpcID.GUARD)
    .toList();
```

#### Ground Items

**Legacy:**
```java
// Old way
TileItem item = Rs2GroundItem.findItem("Coins");
TileItem nearest = Rs2GroundItem.getNearestItem("Dragon bones");
```

**Queryable:**
```java
// New way - using injected cache
Rs2TileItemModel item = rs2TileItemCache.query()
    .withName("Coins")
    .first();

Rs2TileItemModel nearest = rs2TileItemCache.query()
    .withName("Dragon bones")
    .nearest();
```

#### Game Objects

**Legacy:**
```java
// Old way
TileObject tree = Rs2GameObject.findObject("Tree");
TileObject nearest = Rs2GameObject.findObjectById(1234);
```

**Queryable:**
```java
// New way - using injected cache
Rs2TileObjectModel tree = rs2TileObjectCache.query()
    .withName("Tree")
    .nearest();

Rs2TileObjectModel nearest = rs2TileObjectCache.query()
    .withId(1234)
    .nearest();
```

### Step-by-Step Migration

**Step 1:** Add cache injections to your class:
```java
@Inject
Rs2NpcCache rs2NpcCache;
```

**Step 2:** Replace direct method calls with queryable:
```java
// Before
NPC banker = Rs2Npc.getNpc("Banker");

// After
Rs2NpcModel banker = rs2NpcCache.query().withName("Banker");
```

**Step 3:** Add filters if needed:
```java
// Before
NPC cow = Rs2Npc.getNpcs().stream()
    .filter(npc -> npc.getName().equals("Cow"))
    .filter(npc -> npc.getInteracting() == null)
    .findFirst()
    .orElse(null);

// After
Rs2NpcModel cow = rs2NpcCache.query()
    .withName("Cow")
    .where(npc -> !npc.isInteracting())
    .nearest();
```

**Step 4:** Update interaction methods:
```java
// Before
if (banker != null) {
    Rs2Npc.interact(banker, "Bank");
}

// After
if (banker != null) {
    banker.click("Bank");
    // or
    banker.interact("Bank");
}
```

---

## Examples by Use Case

### Combat Scripts

```java
@Inject
Rs2NpcCache rs2NpcCache;

// Find nearest attackable enemy
Rs2NpcModel enemy = rs2NpcCache.query()
    .withName("Goblin")
    .where(npc -> !npc.isInteracting())
    .where(npc -> npc.getHealthRatio() > 0)
    .nearest(10);

if (enemy != null && !Rs2Player.isInCombat()) {
    enemy.click("Attack");
    sleepUntil(() -> Rs2Player.isInCombat(), 2000);
}
```

### Looting Scripts

```java
@Inject
Rs2TileItemCache rs2TileItemCache;

// Find valuable loot
Rs2TileItemModel loot = rs2TileItemCache.query()
    .where(Rs2TileItemModel::isLootAble)
    .where(item -> item.getTotalGeValue() >= 5000)
    .nearest(15);

if (loot != null) {
    loot.pickup();
    sleepUntil(() -> Rs2Inventory.contains(loot.getName()), 3000);
}
```

### Skilling Scripts

```java
@Inject
Rs2TileObjectCache rs2TileObjectCache;

// Find nearest available tree
Rs2TileObjectModel tree = rs2TileObjectCache.query()
    .where(obj -> obj.getName() != null &&
                  obj.getName().equals("Oak tree"))
    .nearest(10);

if (tree != null && !Rs2Player.isAnimating()) {
    tree.click("Chop down");
    sleepUntil(() -> Rs2Player.isAnimating(), 3000);
}
```

### Banking Scripts

```java
@Inject
Rs2TileObjectCache rs2TileObjectCache;

// Find nearest bank
Rs2TileObjectModel bank = rs2TileObjectCache.query()
    .withNames("Bank booth", "Bank chest", "Bank")
    .nearest(20);

if (bank != null && !Rs2Bank.isOpen()) {
    bank.click("Bank");
    sleepUntil(() -> Rs2Bank.isOpen(), 5000);
}
```

---

## Troubleshooting

### Query Returns Null

**Problem:** Query returns `null` even though entity exists.

**Solutions:**

1. **Check distance:**
```java
// Increase search radius
.nearest(20)  // Instead of default
```

2. **Verify name:**
```java
// Names are case-insensitive but must be exact
.withName("Banker")  // Not "banker" or "Bank"
```

3. **Check filters:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

// Simplify query to find the issue
Rs2NpcModel test1 = rs2NpcCache.query().withName("Banker");
Rs2NpcModel test2 = rs2NpcCache.query().withName("Banker").where(filter);
// If test1 works but test2 doesn't, your filter is too restrictive
```

4. **Verify entity is loaded:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

// Wait for entity to appear
Rs2NpcModel npc = sleepUntilNotNull(() ->
    rs2NpcCache.query().withName("Banker").nearest(),
    5000, 600
);
```

### Performance Issues

**Problem:** Queries are slow or cause lag.

**Solutions:**

1. **Limit search area:**
```java
.within(15)  // Only search nearby
```

2. **Cache results:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

// Query once per game tick, not every iteration
List<Rs2NpcModel> npcs = rs2NpcCache.query()
    .withName("Guard")
    .toList();
```

3. **Simplify predicates:**
```java
// Avoid complex calculations in where() clauses
.where(npc -> simpleCheck(npc))  // Good
.where(npc -> complexCalculation(npc))  // Bad
```

### Interaction Failures

**Problem:** Entity found but click doesn't work.

**Solutions:**

1. **Check null:**
```java
@Inject
Rs2NpcCache rs2NpcCache;

Rs2NpcModel npc = rs2NpcCache.query().withName("Banker");
if (npc != null) {  // Always check
    npc.click("Bank");
}
```

2. **Wait for action:**
```java
npc.click("Bank");
sleepUntil(() -> Rs2Bank.isOpen(), 5000);
```

3. **Verify entity still exists:**
```java
if (npc != null && npc.getWorldLocation() != null) {
    npc.click("Bank");
}
```

---

## Best Practices Summary

✅ **DO:**
- Inject caches with `@Inject` annotation
- Use `cache.query()` to access queryables
- Use queryable API for new code
- Chain filters for readability
- Check for null results
- Use `nearest()` for single entities
- Use `toList()` for multiple entities
- Cache query results when appropriate
- Use method references when possible
- Add distance limits to queries
- **Use `nearestOnClientThread()` or `firstOnClientThread()` with name queries**

❌ **DON'T:**
- Create queryables directly with `new`
- Query in tight loops without delays
- Use expensive operations in filters
- Forget null checks
- Create unnecessary intermediate lists
- Use legacy API for new code
- Query without distance limits
- **Use `withName()`/`withNames()` without client thread methods**

---

## Quick Reference

### Imports and Injection

```java
// NPCs
import net.runelite.client.plugins.microbot.api.npc.Rs2NpcCache;
import net.runelite.client.plugins.microbot.api.npc.models.Rs2NpcModel;

// Ground Items
import net.runelite.client.plugins.microbot.api.tileitem.Rs2TileItemCache;
import net.runelite.client.plugins.microbot.api.tileitem.models.Rs2TileItemModel;

// Players
import net.runelite.client.plugins.microbot.api.player.Rs2PlayerCache;
import net.runelite.client.plugins.microbot.api.player.models.Rs2PlayerModel;

// Tile Objects
import net.runelite.client.plugins.microbot.api.tileobject.Rs2TileObjectCache;
import net.runelite.client.plugins.microbot.api.tileobject.models.Rs2TileObjectModel;

// Inject caches in your class
@Inject Rs2NpcCache rs2NpcCache;
@Inject Rs2TileItemCache rs2TileItemCache;
@Inject Rs2PlayerCache rs2PlayerCache;
@Inject Rs2TileObjectCache rs2TileObjectCache;
```

### Quick Examples

```java
// Find nearest NPC by name (use client thread method)
rs2NpcCache.query().withName("Banker").nearestOnClientThread();

// Find ground item by name (use client thread method)
rs2TileItemCache.query().withName("Coins").nearestOnClientThread();

// Find player by name (use client thread method)
rs2PlayerCache.query().withName("PlayerName").nearestOnClientThread();

// Find object by name (use client thread method)
rs2TileObjectCache.query().withName("Tree").nearestOnClientThread();

// Find by ID (no client thread required)
rs2NpcCache.query().withId(NpcID.BANKER).nearest();

// Complex query with name (use client thread method)
rs2NpcCache.query()
    .withName("Guard")
    .where(npc -> !npc.isInteracting())
    .within(10)
    .nearestOnClientThread();
```

---

## Additional Resources

- **CLAUDE.md** - Full framework documentation
- **Example Scripts** - See `api/*/ApiExample.java` files
- **Discord** - https://discord.gg/zaGrfqFEWE
- **Website** - https://themicrobot.com

---

**Last Updated:** January 4, 2026
**Microbot Version:** 2.2.0
**For questions or issues, please visit our Discord community.**
