```mermaid
C4Context
    title Noa Tamagotchi - Diagrama de Contexto
    Person(user, "Jugador", "Interacciona con Noa desde la app Android")
    System(app, "App Noa Tamagotchi", "Juego virtual tipo Tamagotchi")
    System_Ext(store, "Google Play Services", "Servicios de notificaciones y actualizaciones futuras")

    Rel(user, app, "Cuida, juega, compra, personaliza")
    Rel(app, store, "Distribución y futuras APIs", "HTTPS")
```
