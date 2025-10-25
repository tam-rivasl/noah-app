# ADR 0001: Arquitectura MVVM con Jetpack Compose

## Contexto
Se requiere migrar una aplicación previa a un juego Android moderno con experiencia Tamagotchi. El proyecto debe ser escalable, amigable con pruebas y listo para futuras integraciones (Firebase, analíticas, nuevos mini juegos).

## Decisión
Adoptamos una arquitectura MVVM basada en Jetpack Compose:
- **ViewModel (NoaViewModel)** como única fuente de estado para la UI, usando `StateFlow` y corrutinas.
- **Repository (NoaRepository)** encapsula lógica de juego y persistencia vía DataStore.
- **Compose + Navigation** para UI reactiva y desacoplada.
- **DataStore Preferences** para persistencia ligera, permitiendo migrar a Room o Firebase en el futuro.

## Consecuencias
- + Facilita pruebas unitarias del repositorio y ViewModel.
- + UI declarativa simplifica animaciones y accesibilidad.
- + Persistencia desacoplada preparada para sincronización remota.
- − Requiere gestionar degradación de estado manualmente (tick scheduler en ViewModel).
- − Sin wrapper Gradle se depende de instalación local (mitigado documentando requisitos).
