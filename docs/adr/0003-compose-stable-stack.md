# ADR 0003: Migrar a la pila estable de Jetpack Compose y simplificar el juego

## Contexto
El proyecto dependía del plugin `org.jetbrains.kotlin:kotlin-compose-compiler-gradle-plugin:2.0.21` hospedado en repositorios adicionales de JetBrains. Además, la aplicación incluía navegación, minijuegos y lógica compleja que impedía compilar de forma confiable en entornos limpios.

## Decisión
- Volver a la combinación estable Kotlin 1.9.24 + Compose Compiler 1.5.15 distribuida por Google (sin plugin adicional).
- Actualizar el BOM de Jetpack Compose a `2024.06.00`, alineado con el compilador 1.5.15.
- Reducir el alcance funcional a una sola pantalla de cuidado virtual con acciones básicas, manteniendo una arquitectura limpia (DataStore + Repository + ViewModel + Compose UI).

## Consecuencias
- Las dependencias se resuelven únicamente con los repositorios oficiales de Google y Maven Central.
- El build vuelve a ser reproducible y apto para pipelines CI/CD.
- La simplificación facilita la escritura de pruebas unitarias y reduce el costo de mantenimiento.
- Las funcionalidades de navegación y minijuegos se podrán reintroducir en el futuro mediante nuevas historias y ADR específicos.
