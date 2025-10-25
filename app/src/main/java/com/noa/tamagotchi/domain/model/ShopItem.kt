package com.noa.tamagotchi.domain.model

data class ShopItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Int,
    val effect: AttributeEffect
)

data class AttributeEffect(
    val healthDelta: Int = 0,
    val sleepDelta: Int = 0,
    val hungerDelta: Int = 0,
    val happinessDelta: Int = 0,
    val energyDelta: Int = 0
)
