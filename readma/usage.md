```sh
# Scaffold a readma.yaml and a readma/ content directory from the local project
deno run -A jsr:@readma/cli init

# Generate the workspace root and member readmes
deno run -A jsr:@readma/cli gen

# Validate the config and its referenced files
deno run -A jsr:@readma/cli validate

# Print the JSON schema of the config for your editor
deno run -A jsr:@readma/cli schema
```

Refer to the [docs](https://readma.vercel.app) for the full option list
