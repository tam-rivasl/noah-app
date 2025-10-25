# Noa Tamagotchi

Noa Tamagotchi es un juego virtual tipo Tamagotchi desarrollado en Kotlin con Jetpack Compose. Cuida a Noa, un perrito adorable, mediante acciones, tienda virtual y mini juegos para ganar recompensas.

## Requisitos

- Android Studio Ladybug (o superior) con JDK 21
- Android SDK 35 y herramientas de compilación 35
- Gradle 8.7+

## Instalación

```bash
# Clonar el repositorio
git clone <repo>
cd noah-app

# Sin wrapper incluido: usar Gradle del sistema
gradle assembleDebug
```

## Variables de entorno

Crea un archivo `.env.local` si necesitas sobreescribir valores:

```
NOA_DATASTORE_FILE=noa_preferences.pb
```

## Scripts útiles

```bash
# Compilar en modo debug
gradle assembleDebug

# Ejecutar tests unitarios
gradle test
```

## Ejecutar tests

```bash
gradle test
```

Para ejecutar en dispositivo/emulador utiliza Android Studio y selecciona `Run > Run 'app'`.

## Solución de problemas

- **Error `Could not find org.jetbrains.kotlin:kotlin-compose-compiler-gradle-plugin`**: asegúrate de haber sincronizado el proyecto tras añadir el repositorio JetBrains Compose (`https://maven.pkg.jetbrains.space/public/p/compose/dev`). Ejecuta `gradle --refresh-dependencies` si persiste.
