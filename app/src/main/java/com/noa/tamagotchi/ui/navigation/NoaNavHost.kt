package com.noa.tamagotchi.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.noa.tamagotchi.ui.screens.home.HomeScreen
import com.noa.tamagotchi.ui.screens.home.StartScreen
import com.noa.tamagotchi.ui.screens.minigames.MiniGameDetailScreen
import com.noa.tamagotchi.ui.screens.minigames.MiniGamesScreen
import com.noa.tamagotchi.ui.screens.settings.SettingsScreen
import com.noa.tamagotchi.ui.screens.shop.ShopScreen
import com.noa.tamagotchi.ui.state.NoaUiState
import com.noa.tamagotchi.ui.viewmodel.NoaViewModel

@Composable
fun NoaNavHost(
    uiState: NoaUiState,
    viewModel: NoaViewModel
) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = NoaDestination.Start.route
    ) {
        composable(NoaDestination.Start.route) {
            StartScreen(
                uiState = uiState,
                onStart = { navController.navigate(NoaDestination.Home.route) }
            )
        }
        composable(
            route = NoaDestination.Home.route,
            enterTransition = {
                slideIntoContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(500)
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(500)
                )
            }
        ) {
            HomeScreen(
                uiState = uiState,
                onAction = viewModel::onAction,
                onNavigateToShop = { navController.navigate(NoaDestination.Shop.route) },
                onNavigateToMiniGames = { navController.navigate(NoaDestination.MiniGames.route) },
                onClaimDailyReward = viewModel::onClaimDailyReward
            )
        }
        composable(NoaDestination.Shop.route) {
            ShopScreen(
                uiState = uiState,
                onBack = { navController.popBackStack() },
                onPurchase = viewModel::onPurchase,
                onUseItem = viewModel::onUseItem
            )
        }
        composable(NoaDestination.MiniGames.route) {
            MiniGamesScreen(
                uiState = uiState,
                onBack = { navController.popBackStack() },
                onOpenMiniGame = { miniGame ->
                    navController.navigate("${NoaDestination.MiniGameDetail.route}/${miniGame.id}")
                }
            )
        }
        composable(
            route = "${NoaDestination.MiniGameDetail.route}/{miniGameId}",
            arguments = listOf(navArgument("miniGameId") { type = NavType.StringType })
        ) { backStackEntry ->
            val miniGameId = backStackEntry.arguments?.getString("miniGameId")
            val miniGame = uiState.miniGames.firstOrNull { it.id == miniGameId }
            if (miniGame != null) {
                MiniGameDetailScreen(
                    miniGame = miniGame,
                    onBack = { navController.popBackStack() },
                    onComplete = {
                        viewModel.onMiniGameCompleted(miniGame.id)
                        navController.popBackStack()
                    }
                )
            } else {
                LaunchedEffect(Unit) { navController.popBackStack() }
            }
        }
        composable(NoaDestination.Settings.route) {
            SettingsScreen(onBack = { navController.popBackStack() })
        }
    }
}
