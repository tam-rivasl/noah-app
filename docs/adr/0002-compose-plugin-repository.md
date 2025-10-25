# ADR 0002: Añadir repositorio JetBrains Compose para el plugin Kotlin Compose Compiler

## Contexto
El build fallaba con el error `Could not find org.jetbrains.kotlin:kotlin-compose-compiler-gradle-plugin:2.0.21` al sincronizar Gradle. El repositorio configurado previamente (`kotlin/p/kotlin/dev`) no aloja el artefacto del plugin requerido por la versión actual del proyecto.

## Decisión
Agregar el repositorio `https://maven.pkg.jetbrains.space/public/p/compose/dev` al bloque `buildscript.repositories` en `build.gradle.kts` para que Gradle pueda resolver `org.jetbrains.kotlin:kotlin-compose-compiler-gradle-plugin:2.0.21`.

## Consecuencias
- Gradle obtiene el plugin desde el repositorio oficial de JetBrains Compose.
- Se debe documentar el repositorio adicional para futuros mantenedores.
- Mantener vigilancia sobre actualizaciones del plugin para remover la dependencia del repositorio adicional si Google/Maven Central lo publican.
