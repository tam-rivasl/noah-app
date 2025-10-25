# Runbook - Noa Tamagotchi

## Arranque
1. Abrir el proyecto en Android Studio (Ladybug o superior) y sincronizar Gradle.
2. Configurar un emulador Android 13+ o dispositivo físico.
3. Ejecutar `gradle assembleDebug` (o usar `Run > Run 'app'`).
4. Verificar que la pantalla principal muestre los indicadores de Noa y los botones de acción.

## Troubleshooting
- **Gradle sin wrapper:** Instala Gradle 8.7+ y exporta `GRADLE_HOME`.
- **Fallo al resolver dependencias:** Ejecuta `gradle --refresh-dependencies` y limpia cachés de Android Studio.
- **Estado corrupto:** Borra los datos de la app o elimina el archivo `noa_tamagotchi.json` en el almacenamiento interno.
- **UI sin actualizar:** Usa el botón de refresco o reinicia la app para recrear el `ViewModel`.
- **SDK no encontrado:** Instala el Android SDK 35 y configura `ANDROID_HOME` o el archivo `local.properties` (`sdk.dir=/ruta/al/sdk`).

## Logs y métricas
- Utiliza Logcat con filtro del paquete `com.noa.tamagotchi` para depurar.
- Métricas sugeridas: frecuencia de acciones (`FEED`, `PLAY`, etc.), monedas acumuladas, nivel alcanzado. Se pueden exportar a Analytics en futuras iteraciones.

## Alertas
- Configura alertas en CI si fallan `gradle test` o `gradle assembleDebug`.
- Monitorea tamaño del archivo DataStore (>1 MB puede indicar fugas de estado).

## Límites conocidos
- Estado persistente local sin sincronización en la nube.
- Acciones avanzadas (tienda, minijuegos) fueron retiradas en este release.
