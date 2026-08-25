The template is based upon VS2022, C# Dotnet 9.0, Angular v22.x, Bootstrap and Bootstrap-icons. Home page is a bootstrap Nav bar plus a getting-started/setup guide (same content as `INSTALL.html`) — replace it with your own content whenever you're ready.

## CORS

The API only allows same-origin requests by default (the Angular SPA is served from this same app). If you need to call the API from a separately-hosted frontend, add its origin(s) to `AllowedOrigins` in the relevant `appsettings.*.json`:
```json
"AllowedOrigins": [ "https://your-frontend-domain.com" ]
```

## Setup

To install it, download the source code and put them in source/repos.  From the windows powershell or cmd in source/repos/StandaloneAngularTemplate folder, TYPE:
```
dotnet new --install .
```
or
```
dotnet new install .
```

To uninstall it, from source/repos type
```
dotnet new uninstall StandaloneAngularTemplate.template
```
To create a new project from this template from source/repos type:
```
dotnet new standalone-angular -o <MyNewProject>
```
Run vs2022, built the solution... Done!
