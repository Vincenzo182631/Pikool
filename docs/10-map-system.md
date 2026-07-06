# 10 — Map System

The map is PicklePlay's flagship surface — the definitive interactive map of the
pickleball world. Built on **Google Maps Platform**.

## Google Maps Platform usage

- **Maps JavaScript API** — the interactive map (via `@vis.gl/react-google-maps`).
- **Places API** — location search, autocomplete, and enriching POIs.
- **Geocoding API** — address ↔ coordinates (server-side for listings).
- **Directions** — deep-link to native maps (`https://www.google.com/maps/dir/?...`)
  rather than rendering routes in-app for v1.

**Keys:** a browser key (HTTP-referrer-restricted, Maps JS + Places) and a
server key (IP-restricted, Geocoding/Places) — see `17`. Never ship the server
key to the client.

## Map layers

Toggleable via `MapFilterBar`:

| Layer | Source | Marker |
|-------|--------|--------|
| Pickleball courts | `GET /courts` (bbox) | court pin + busy color |
| Sport stores | `GET /stores` | store pin |
| Coaches | verified coaches (geo) | coach pin |
| Clubs | `GET /clubs` | club pin |
| Tournaments | `GET /tournaments` | trophy pin |
| Parking / Restrooms / Water | `Place` (POIs) | utility icons |
| Coffee / Restaurants / Hotels | `Place` (POIs / Places API) | amenity icons |

Courts are the primary layer and default-on; others are opt-in to avoid clutter.

## Data loading & performance

- **Viewport-driven:** load markers for the current **bounding box** only. On map
  `idle`, read bounds and call `GET /courts?bbox=minLng,minLat,maxLng,maxLat`
  (debounced ~300ms).
- **Clustering:** cluster markers at low zoom (`MarkerCluster`); expand on zoom.
- **Caching:** cache bbox query results in Redis (short TTL) + client Query cache
  keyed by rounded bounds to avoid refetch on tiny pans.
- **Payload:** list endpoints return lightweight marker DTOs (id, lat, lng, name,
  ratingAvg, busyLevel); full detail is fetched on marker open.

## Geospatial queries

- **v1:** bounding-box filter on indexed `lat`/`lng` columns, refined by Haversine
  distance in the service layer for radius/sort.
- **Scale:** adopt **PostGIS** (`geography` column + `ST_DWithin`, GiST index) for
  precise, high-volume "within N km" queries and distance sorting.
- Sorting: `?sort=distance` (needs `lat`/`lng` params) or `?sort=rating`.

## Court detail

Opening a court marker → `CourtDetailPanel` (floating glass card on desktop,
bottom sheet on mobile) showing:
- Photos gallery, `RatingBadge` + review summary.
- Surface, indoor/outdoor, lighting, amenities.
- Open-play schedule.
- **Live busy level** (`BusyLevelMeter`) and **current players checked in** with
  skill levels present + estimated wait.
- Directions (deep-link), Save, Check-in / QR check-in.

Data: `GET /courts/:id` + `GET /courts/:id/occupancy`; occupancy updates via
socket (`11`).

## Check-in & occupancy

- **Check-in:** `POST /checkins { courtId }` (optionally with a signed **QR
  token** scanned at the court). Creates a `CheckIn` with `expiresAt`
  (default +3h).
- **Occupancy** = count of non-expired check-ins for a court. Mirrored in a
  **Redis counter** for O(1) realtime reads; the DB remains source of truth.
- **Busy level** buckets occupancy into quiet / moderate / busy (thresholds
  configurable per court capacity if known).
- **Realtime:** clients viewing a court join a `court:{id}` socket room and
  receive `court:occupancy` events on check-in/out/expiry. See
  [`11-realtime-features.md`](./11-realtime-features.md).
- **Estimated wait:** heuristic from current occupancy vs. typical capacity and
  format; shown as a range, clearly approximate.

## QR check-in

- Each court can display a QR encoding a signed, court-scoped token.
- Scanning opens `/courts/:id?qr=<token>`; the client posts the token with the
  check-in. Server validates signature + court binding + freshness → prevents
  spoofed remote check-ins.

## Geolocation UX

- Ask for browser geolocation on first map open (permission-gentle); fall back to
  IP-based city center or a searched location.
- "Locate me" control recenters; the map remembers the last viewport.
- Never block the map on geolocation — render immediately, then recenter.

## Adding & editing places

- **Court/Store owners** and **Admins** create/edit listings (`06`); new
  user-submitted courts enter a **pending** state until admin-verified (`13`).
- Geocode addresses server-side on create; store both coordinates and address.

## Accessibility & fallback

- Provide a **list view** alternative to the map (same filters) for keyboard and
  screen-reader users and low-bandwidth contexts.
- Markers have accessible labels; the detail panel is fully keyboard-navigable.
- Respect reduced motion (no marker bounce animations when disabled).

## Cost controls

- Debounce viewport queries; cache aggressively; lazy-load the Maps JS bundle
  only on map routes; use static map images for non-interactive previews (e.g. a
  small court thumbnail) to limit dynamic map loads.
