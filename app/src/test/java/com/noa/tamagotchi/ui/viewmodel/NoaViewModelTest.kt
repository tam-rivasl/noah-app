package com.noa.tamagotchi.ui.viewmodel

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class NoaViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun `initial state is walking`() = runTest {
        val viewModel = NoaViewModel()

        assertEquals(NoaState.WALKING, viewModel.state.value)
    }

    @Test
    fun `feed transitions to eating and returns to walking after delay`() = runTest {
        val viewModel = NoaViewModel()

        viewModel.feed()
        assertEquals(NoaState.EATING, viewModel.state.value)

        advanceTimeBy(2_500)
        advanceUntilIdle()

        assertEquals(NoaState.WALKING, viewModel.state.value)
    }

    @Test
    fun `sleep keeps noa sleeping until walk called`() = runTest {
        val viewModel = NoaViewModel()

        viewModel.sleep()
        assertEquals(NoaState.SLEEPING, viewModel.state.value)

        advanceTimeBy(5_000)
        advanceUntilIdle()
        assertEquals(NoaState.SLEEPING, viewModel.state.value)

        viewModel.walk()
        assertEquals(NoaState.WALKING, viewModel.state.value)
    }

    @Test
    fun `feed request while sleeping is ignored`() = runTest {
        val viewModel = NoaViewModel()

        viewModel.sleep()
        viewModel.feed()

        advanceTimeBy(5_000)
        advanceUntilIdle()

        assertEquals(NoaState.SLEEPING, viewModel.state.value)
    }
}
