# Autonomous Database Setup 🚀

This application features **fully autonomous database setup** - no manual configuration required!

## How It Works

The app automatically detects and sets up the best database option for your environment:

1. **📡 Online Database First** - If `POSTGRES_URL` is set, connects to your online database (Neon, Supabase, etc.)
2. **💾 Local Fallback** - If `POSTGRES_URL` is empty, automatically starts an embedded PGlite database
3. **🔄 Auto-Migration** - Automatically creates all required tables on startup
4. **📁 Data Persistence** - Local data stored in `./data/pglite/` directory

## User Experience

### For End Users (Zero Setup)
- Just run the app → it works immediately
- No Docker, no Postgres installation needed
- Data persists between app restarts
- Works offline completely

### For Developers (Online Database)
```bash
# Option 1: Use online database (Neon, Supabase, etc.)
POSTGRES_URL=postgresql://user:pass@your-db.neon.tech/dbname

# Option 2: Leave empty for automatic local database
POSTGRES_URL=

# That's it! The app handles everything else automatically.
```

## Quick Start Commands

```powershell
# Install dependencies (if needed)
pnpm install

# Start the app (everything auto-configures)
pnpm dev
# or for production build
pnpm build && pnpm start
```

## What Happens Automatically

1. **App Startup Detection**
   ```
   🚀 Initializing autonomous database system...
   📡 Checking for online database...
   💾 Starting local embedded database (PGlite)...
   🔄 Running migrations...
   ✅ Database ready!
   ```

2. **Database Selection Logic**
   - Has `POSTGRES_URL`? → Use online PostgreSQL
   - No `POSTGRES_URL`? → Use local PGlite embedded database
   - Connection fails? → Fallback to local database

3. **Automatic Features**
   - Schema creation
   - Table migrations  
   - Default data setup
   - Connection pooling
   - Error recovery

## Database Types

### 🌐 Online PostgreSQL (Recommended for Production)
- **When**: `POSTGRES_URL` is set in .env
- **Examples**: Neon, Supabase, Railway, PlanetScale
- **Benefits**: Scalable, backups, multi-user
- **Setup**: Just add your database URL

### 💾 Local PGlite (Perfect for Development/Testing)
- **When**: `POSTGRES_URL` is empty/missing
- **What**: Real Postgres compiled to WebAssembly
- **Benefits**: No installation, works offline, fast
- **Storage**: `./data/pglite/` folder
- **Size**: ~3MB bundle increase

## Migration Between Database Types

### From Local to Online
1. Set `POSTGRES_URL` in .env
2. Restart the app
3. App automatically detects and uses online database
4. Run migration: `pnpm db:auto-migrate` (if needed)

### From Online to Local  
1. Remove or comment out `POSTGRES_URL` in .env
2. Restart the app  
3. App automatically falls back to local embedded database

## Manual Controls (Optional)

```powershell
# Force run migrations on current database
pnpm db:auto-migrate

# View database in Drizzle Studio
pnpm db:studio

# Generate new migration files  
pnpm db:generate
```

## Troubleshooting

### Database Connection Issues
- **Online DB fails**: App automatically falls back to local database
- **Local DB fails**: Check `./data/pglite/` folder permissions
- **Migration errors**: Run `pnpm db:auto-migrate` manually

### Performance Tips
- **Development**: Use local PGlite (faster, no network)
- **Production**: Use online database (scalable, persistent)
- **Testing**: Local PGlite works perfectly

### Data Location
- **Local data**: `./data/pglite/` directory
- **Online data**: Your cloud database
- **Migrations**: `./drizzle/` directory

## Features Guaranteed

✅ **Full Postgres compatibility** - PGlite is real Postgres  
✅ **All existing features work** - Auth, chat history, projects  
✅ **Automatic fallback** - Never fails to start  
✅ **Zero configuration** - Works out of the box  
✅ **Data persistence** - Survives app restarts  
✅ **Migration safety** - Handles schema updates  

## Example .env Configurations

### Local Development (Zero Setup)
```bash
# Just these - database auto-configures
OPENAI_API_KEY=sk-your-key-here
BETTER_AUTH_SECRET=your-secret-here
# POSTGRES_URL= (empty or omitted)
```

### Production with Neon
```bash
OPENAI_API_KEY=sk-your-key-here
BETTER_AUTH_SECRET=your-secret-here  
POSTGRES_URL=postgresql://user:pass@ep-example.neon.tech/dbname?sslmode=require
```

### Production with Supabase
```bash
OPENAI_API_KEY=sk-your-key-here
BETTER_AUTH_SECRET=your-secret-here
POSTGRES_URL=postgresql://postgres:pass@db.example.supabase.co:5432/postgres
```

That's it! The autonomous database system handles everything else automatically. 🎉