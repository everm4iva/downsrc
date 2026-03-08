# Actions

Actions are custom commands that you can define and run with Downsrc.

## What are Actions?

Actions allow you to create shortcuts for commonly used commands or workflows. They are stored in `resources/actions.json`.

## Managing Actions

### List All Actions

```bash
downsrc action list
```

Or simply:

```bash
downsrc action
```

### Add an Action

```bash
downsrc action add <name> <command>
```

Example:

```bash
downsrc action add backup "cp -r ./downloads ./backup"
downsrc action add clean "rm -rf ./downloads/*"
downsrc action add notify "echo Download complete!"
```

### Remove an Action

```bash
downsrc action remove <name>
```

Example:

```bash
downsrc action remove backup
```

## Running Actions

Execute an action with the `run` command:

```bash
downsrc run <action-name>
```

Example:

```bash
downsrc run backup
downsrc run clean
```

## Action Examples

### Post-Download Notification

```bash
downsrc action add notify "notify-send 'Downsrc' 'Download complete!'"
```

### Organize Downloads

```bash
downsrc action add organize "mkdir -p ./downloads/images && mv ./downloads/*.jpg ./downloads/images/"
```

### Backup Downloads

```bash
downsrc action add backup "tar -czf downloads_backup.tar.gz ./downloads"
```

### Clean Temp Files

```bash
downsrc action add clean-temp "rm -rf ./.downsrc_temp"
```

## Actions File Format

Actions are stored in JSON format in `resources/actions.json`:

```json
{
	"actions": [
		{"name": "example", "command": "echo Hello from Downsrc!"},
		{"name": "backup", "command": "cp -r ./downloads ./backup"}
	]
}
```

## Best Practices

1. Use descriptive names for your actions
2. Test commands before adding them as actions
3. Be careful with destructive commands (rm, del, etc.)
4. Document your custom actions in comments
5. Keep commands simple and focused on one task

## Advanced Usage

### Chaining Commands

You can chain multiple commands in a single action:

**Linux/Mac:**

```bash
downsrc action add full-cleanup "rm -rf ./downloads/* && rm -rf ./.downsrc_temp && echo Cleanup complete"
```

**Windows:**

```bash
downsrc action add full-cleanup "del /q downloads\\* & echo Cleanup complete"
```

### Using Variables

While Downsrc actions don't support parameters directly, you can use environment variables:

```bash
downsrc action add backup-dated "cp -r ./downloads ./backup-$(date +%Y%m%d)"
```
