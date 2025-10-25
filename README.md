# Noa Tamagotchi

Aplicación Android nativa desarrollada en Kotlin con Jetpack Compose que permite cuidar a Noa, un tamagotchi minimalista. El proyecto sigue una arquitectura sencilla (DataStore + Repository + ViewModel + Compose UI) que compila en entornos limpios sin dependencias experimentales.

## Requisitos
- Android Studio Ladybug o superior con JDK 21
- Android SDK 35 y Build Tools 35
- Gradle 8.7+

## Stack
- Kotlin 1.9.24
- Jetpack Compose Material 3 (BOM 2024.06.00)
- AndroidX ViewModel + StateFlow
- Jetpack DataStore + Kotlin Serialization

## Instalación
```bash
# Clonar el repositorio
git clone <repo>
cd noah-app

# Sin wrapper incluido: usa el Gradle del sistema
gradle clean assembleDebug
```

## Variables de entorno
La aplicación no requiere secretos. Opcionalmente puedes definir la ruta del DataStore:
```bash
export NOA_DATASTORE_FILE=noa_tamagotchi.json
```

## Scripts útiles
```bash
# Compilar en modo debug
gradle assembleDebug

# Ejecutar pruebas unitarias
gradle test

# Limpiar artefactos previos
gradle clean
```

## Ejecutar tests
```bash
gradle test
```

Para probar en emulador/dispositivo abre el proyecto en Android Studio y ejecuta la configuración `app`.

## Seguridad y buenas prácticas
- Persistencia local con DataStore sin almacenar secretos sensibles.
- UI accesible con descripciones de contenido (`contentDescription`).
- Arquitectura en capas para facilitar futuras extensiones (autenticación, analítica, etc.).
