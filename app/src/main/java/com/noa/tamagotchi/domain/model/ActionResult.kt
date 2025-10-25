package com.noa.tamagotchi.domain.model

data class ActionResult(
    val state: NoaState,
    val message: String? = null
)
