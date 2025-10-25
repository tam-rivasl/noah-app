package com.noa.tamagotchi

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import com.noa.tamagotchi.data.NoaPreferencesDataSource
import com.noa.tamagotchi.data.NoaRepository
import com.noa.tamagotchi.domain.model.GameAction
import kotlinx.coroutines.test.runTest
import okio.Path.Companion.toPath
import org.junit.After
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.nio.file.Files

class NoaRepositoryTest {

    private lateinit var tempDir: java.nio.file.Path
    private lateinit var repository: NoaRepository

    @Before
    fun setUp() = runTest {
        tempDir = Files.createTempDirectory("noa-test")
        val dataStore = PreferenceDataStoreFactory.createWithPath(
            produceFile = { tempDir.resolve("noa.preferences_pb").toString().toPath() }
        )
        val dataSource = NoaPreferencesDataSource(dataStore)
        repository = NoaRepository(dataSource)
        repository.refreshState()
    }

    @After
    fun tearDown() {
        tempDir.toFile().deleteRecursively()
    }

    @Test
    fun feedActionImprovesHunger() = runTest {
        val before = repository.refreshState()
        val result = repository.performAction(GameAction.FEED)
        assertTrue(result.state.hunger >= before.hunger)
    }

    @Test
    fun dailyRewardOnlyOncePerDay() = runTest {
        val first = repository.claimDailyReward()
        val second = repository.claimDailyReward()
        assertTrue(first.state.coins >= second.state.coins)
    }
}
