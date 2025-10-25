package com.noa.tamagotchi.data

import com.noa.tamagotchi.domain.model.TamagotchiAction
import com.noa.tamagotchi.domain.model.TamagotchiSnapshot
import java.util.concurrent.atomic.AtomicReference
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TamagotchiRepositoryTest {

    @Test
    fun feedActionImprovesHunger() = runTest {
        val fakeDataSource = InMemoryDataSource()
        val repository = TamagotchiRepository(fakeDataSource) { 0L }

        val initial = repository.refresh()
        val result = repository.applyAction(TamagotchiAction.FEED)

        assertTrue(result.hunger >= initial.hunger)
    }

    @Test
    fun rewardDailyCoinsOnlyOncePerInterval() = runTest {
        val fakeDataSource = InMemoryDataSource()
        var currentTime = 0L
        val repository = TamagotchiRepository(fakeDataSource) { currentTime }

        val initial = repository.refresh()
        val first = repository.rewardDailyCoins()
        currentTime += 60 * 60 * 1000L // 1 hora
        val second = repository.rewardDailyCoins()

        assertEquals(initial.coins + 25, first.coins)
        assertEquals(first.coins, second.coins)
    }

    @Test
    fun refreshDegradesStatsOverTime() = runTest {
        val fakeDataSource = InMemoryDataSource()
        var currentTime = 0L
        val repository = TamagotchiRepository(fakeDataSource) { currentTime }

        repository.refresh()
        currentTime += 3 * 60 * 1000L
        val after = repository.refresh()

        assertTrue(after.energy < 65)
        assertTrue(after.hunger < 70)
    }
}

private class InMemoryDataSource : TamagotchiStateDataSource {
    private val state = AtomicReference(TamagotchiSnapshot())
    private val flow = MutableStateFlow(state.get())

    override val snapshotFlow: Flow<TamagotchiSnapshot> = flow.asStateFlow()

    override suspend fun read(): TamagotchiSnapshot = state.get()

    override suspend fun update(transform: (TamagotchiSnapshot) -> TamagotchiSnapshot): TamagotchiSnapshot {
        val newValue = transform(state.get())
        state.set(newValue)
        flow.value = newValue
        return newValue
    }
}
