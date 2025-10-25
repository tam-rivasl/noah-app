# Tech Spec - Noa Tamagotchi

## Contexto
El proyecto migra una aplicación previa a un juego móvil nativo Android escrito en Kotlin con Jetpack Compose. El objetivo es ofrecer una experiencia tipo Tamagotchi con Noa, un perrito virtual que el usuario debe cuidar a través de acciones, tienda, mini juegos y un sistema de progresión persistente.

## Arquitectura
- **Capa de datos**: `NoaPreferencesDataSource` usa Jetpack DataStore (Preferences) para persistir el estado de Noa. `NoaRepository` encapsula reglas de negocio (acciones, tienda, mini juegos, recompensas) y expone `Flow<NoaState>`.
- **Capa de dominio**: Modelos `NoaState`, `ShopItem`, `MiniGame`, `AttributeEffect`, `GameAction` y `ActionResult` representan entidades del juego y efectos.
- **Capa de presentación**: `NoaViewModel` (MVVM) maneja `StateFlow<NoaUiState>` y emite eventos. UI construida con Jetpack Compose y Material 3 (`StartScreen`, `HomeScreen`, `ShopScreen`, `MiniGamesScreen`, `MiniGameDetailScreen`, `SettingsScreen`) con navegación `NavHost`.
- **Persistencia**: DataStore Preferences, serialización con `kotlinx.serialization` para inventario.
- **Mini juegos**: Dos pantallas interactivas simples (`catch_ball`, `jump_obstacles`) con lógica basada en timers y acciones del usuario.

## Tecnologías
- Kotlin 2.0.21, Jetpack Compose (Material 3, Navigation, Animation)
- AndroidX Lifecycle ViewModel + StateFlow
- DataStore Preferences + Kotlin Serialization
- Coroutines, Turbine para pruebas reactivas
- Repositorios Gradle: Google, Maven Central, JetBrains Kotlin Dev y JetBrains Compose Dev (para el plugin `kotlin-compose-compiler`)

## Contratos principales
- `NoaRepository.performAction(GameAction): ActionResult`
- `NoaRepository.purchase(ShopItem): ActionResult`
- `NoaRepository.useItem(ShopItem): ActionResult`
- `NoaRepository.rewardFromMiniGame(MiniGame): ActionResult`
- `NoaRepository.claimDailyReward(): ActionResult`
- `NoaRepository.refreshState(): NoaState`
- `NoaViewModel.uiState: StateFlow<NoaUiState>`

## Seguridad
- DataStore almacena preferencias locales sin datos sensibles; se evita exponer secretos en código.
- UI accesible con `contentDescription` y componentes Material 3.
- Preparado para futuras integraciones (Firebase/Auth) mediante MVVM y `NoaRepository` como único punto de verdad.

## Plan de pruebas
- Tests unitarios en `NoaRepositoryTest` verifican acciones clave (alimentar, recompensa diaria) usando DataStore en disco temporal.
- Validación manual en Android Studio para navegación, mini juegos y animaciones.
- Pipeline sugerida: `lint → typecheck → test → assemble` (extensible a SBOM, análisis estático, empaquetado Docker si aplica backend futuro).
- Validar sincronización de dependencias tras cambios de repositorios (`gradle --refresh-dependencies`).
