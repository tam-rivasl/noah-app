# Runbook - Noa Tamagotchi

## Arranque
1. Abrir el proyecto en Android Studio (Ladybug o superior).
2. Sincronizar Gradle (`File > Sync Project with Gradle Files`).
3. Seleccionar un dispositivo virtual con Android 13+.
4. Ejecutar `Run > Run 'app'`.

## Troubleshooting
- **Gradle sin wrapper**: Instalar Gradle 8.7+ (`sdkman`, `asdf` o paquete oficial). Exportar `GRADLE_HOME` si es necesario.
- **Fallos de compilación por dependencias**: Ejecutar `gradle --refresh-dependencies`.
- **`kotlin-compose-compiler-gradle-plugin` no encontrado**: Verificar que el repositorio JetBrains Compose (`https://maven.pkg.jetbrains.space/public/p/compose/dev`) permanezca configurado en `build.gradle.kts`.
- **DataStore corrupto**: Borrar datos de la app (`Settings > Apps > Noa Tamagotchi > Storage > Clear data`).
- **Lentitud o animaciones trabadas**: Reducir duración de animaciones en opciones de desarrollador o desactivar mini juegos temporales.

## Logs y métricas
- Logs disponibles en `Logcat` (tag `NoaViewModel` puede agregarse si se habilitan logs futuros).
- Métricas sugeridas: tiempo de sesión, frecuencia de mini juegos, balance de monedas (a integrar con Firebase Analytics).

## Alertas
- Implementar en el futuro integraciones con Firebase Crashlytics y Performance Monitoring.
- Configurar alertas de compilación en CI (fallos de `gradle test` o `gradle assemble`).
