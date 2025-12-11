# Replay Favorites Feature

This document describes the implementation of the Replay Favorites feature for Pokemon Showdown.

## Overview

Users can now favorite replays to organize and quickly access their favorite battles. The favorites feature includes:

- **Personal favorites list**: Each user has their own favorites collection
- **Privacy controls**: Users see all their favorited replays (public and private), while others only see public replays in someone's favorites
- **Easy management**: Add replays via URL/ID or directly from the replay viewer with a star button
- **Quick access**: Navigate to favorites from the main replay search page

## Database Schema

A new table `ntbb_replay_favorites` was created with the following structure:

```sql
CREATE TABLE IF NOT EXISTS `ntbb_replay_favorites` (
  `userid` varchar(18) NOT NULL,
  `replayid` varchar(50) NOT NULL,
  `addtime` int(11) NOT NULL,
  PRIMARY KEY (`userid`, `replayid`),
  KEY `userid_index` (`userid`),
  KEY `addtime_index` (`addtime`)
);
```

**Installation**: Run the SQL file at `lib/ntbb-replay-favorites.sql` on your database.

## Backend Implementation

### PHP Library (`replay.pokemonshowdown.com/replays.lib.php`)

Added the following methods to the `Replays` class:

- `addFavorite($userid, $replayid)` - Add a replay to user's favorites
- `removeFavorite($userid, $replayid)` - Remove a replay from favorites
- `isFavorited($userid, $replayid)` - Check if a replay is favorited
- `getFavorites($userid, $viewerUserid, $page)` - Get user's favorites with privacy filtering
- `getFavoritesCount($userid, $viewerUserid)` - Count user's favorites

### API Endpoints

Created four new API endpoints:

1. **`/api/replays/favorites-add.php`** - Add replay to favorites (POST)
   - Requires login
   - Validates replay exists
   - Returns: `{"success": true, "replayid": "..."}`

2. **`/api/replays/favorites-remove.php`** - Remove replay from favorites (POST)
   - Requires login
   - Returns: `{"success": true, "replayid": "..."}`

3. **`/api/replays/favorites-list.php`** - List user's favorites (GET)
   - Parameters: `userid`, `page` (optional)
   - Filters private replays if viewer is not the owner
   - Returns: JSON array of replay objects

4. **`/api/replays/favorites-check.php`** - Check if replay is favorited (GET)
   - Requires login
   - Parameter: `replayid`
   - Returns: `{"favorited": true/false, "replayid": "..."}`

## Frontend Implementation

### New Components (`replay.pokemonshowdown.com/src/replays-index.tsx`)

**`FavoritesPanel`** - Main favorites management UI
- Displays user's favorited replays
- Add replays by URL or ID via input field
- Remove button (trash icon) for each replay
- Pagination support
- View other users' public favorites

### Modified Components

**`SearchPanel`** (`replays-index.tsx`) - Added "My Favorites" button at the top for quick access

**`BattlePanel`** (`replays-battle.tsx`) - Added favorite toggle button
- Star icon button next to download button
- Shows "Favorited" with filled star if already favorited
- Shows "Favorite" with empty star if not favorited
- Automatically checks favorite status on load

**`PSReplays`** (`replays.tsx`) - Added routing for favorites
- Route: `/favorites` or `#favorites`
- Query params: `?user=username&page=2` for viewing others' favorites

## Technical Details

### Privacy Filtering

The `getFavorites()` method implements privacy filtering at the database level:
- When viewing your own favorites: Shows all replays where `private != 3` (excludes deleted)
- When viewing others' favorites: Shows only replays where `private = 0` (public only)

### Pagination

Favorites are paginated with 50 items per page. The backend fetches 51 items to determine if there's a next page.

### Data Flow

1. User clicks favorite button → Frontend calls `favorites-add.php`
2. API validates user session and replay existence
3. Database inserts record with `addtime` timestamp
4. Success response triggers UI update

### Error Handling

API endpoints return appropriate error messages:
- `"Not logged in"` - No valid session
- `"Missing replayid"` - Required parameter not provided
- `"Invalid replayid format"` - Replay ID doesn't match expected pattern
- `"Replay not found"` - Replay doesn't exist in database

## User Experience

### Adding Favorites

1. **From replay viewer**: Click the star button next to "Download"
2. **From favorites page**: Enter replay URL or ID in the input field

### Viewing Favorites

1. Click "My Favorites" button on the replay search page
2. Or navigate to `/favorites` or `#favorites`
3. To view another user's favorites: enter their username in the input field

### Privacy Behavior

- **Own favorites**: See all favorited replays (public and private)
- **Others' favorites**: Only see public replays they've favorited
- **Deleted replays** (private=3): Excluded from favorites lists

## URL Structure

- `/favorites` - View your own favorites
- `/favorites?user=username` - View another user's public favorites
- `/favorites?page=2` - Pagination
- `/favorites?user=username&page=2` - Combined

## Building

After making changes to TypeScript files, rebuild:

```bash
node build-tools/compiler.js
```

Or for full rebuild with data:
```bash
./build-tools/update
```

## Testing

To test locally:

1. Set up the database:
   ```bash
   mysql -u root your_database < lib/ntbb-replay-favorites.sql
   ```

2. Configure database connection in `config/replay-config.inc.php`:
   ```php
   $config_replay_database = [
       'server' => '127.0.0.1',
       'username' => 'your_username',
       'password' => 'your_password',
       'database' => 'your_database',
       'prefix' => 'ntbb_',
       'charset' => 'utf8mb4',
   ];
   ```

3. Compile TypeScript:
   ```bash
   node build-tools/compiler.js
   ```

4. Start a local PHP server:
   ```bash
   php -S localhost:8000 -t .
   ```

5. Open `http://localhost:8000/replay.pokemonshowdown.com/testclient.html` in a browser

**Note**: Full authentication requires the complete Pokemon Showdown server setup with user/session tables. For basic UI testing, you can test the interface without login functionality.

## Future Enhancements

Potential improvements for future versions:

1. **Bulk operations** - Select multiple replays to remove at once
2. **Favorites limit** - Implement max favorites per user (suggested: 5000)
3. **Rate limiting** - Add operation limits per hour (suggested: 100/hour)
4. **Search within favorites** - Filter favorites by format or player
5. **Folders/Tags** - Organize favorites into categories
6. **Export** - Download favorites list as JSON/CSV
7. **Share lists** - Create shareable collections of replays
8. **Sort options** - Sort by date added, date played, rating, etc.

## API Examples

### Add a favorite
```javascript
fetch('/api/replays/favorites-add.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'replayid=gen8ou-123456789'
})
```

### Get favorites list
```javascript
fetch('/api/replays/favorites-list.php?userid=someuser&page=1')
  .then(r => r.text())
  .then(data => {
    const favorites = JSON.parse(data.slice(1)); // Remove leading ']' (anti-CSRF)
    console.log(favorites);
  })
```

### Check if favorited
```javascript
fetch('/api/replays/favorites-check.php?replayid=gen8ou-123456789')
  .then(r => r.json())
  .then(data => console.log(data.favorited))
```
