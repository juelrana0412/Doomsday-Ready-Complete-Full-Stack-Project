def calculate_booking(bundle_sizes, group_size):

    INF = float('inf')

    # Minimum bundles needed for each seat count
    dp = [INF] * (group_size + 1)

    # Remember the last bundle used
    previous_bundle = [None] * (group_size + 1)

    dp[0] = 0

    # Dynamic Programming
    for amount in range(1, group_size + 1):

        for bundle in bundle_sizes:

            if amount >= bundle:

                candidate = dp[amount - bundle] + 1

                if candidate < dp[amount]:

                    dp[amount] = candidate

                    previous_bundle[amount] = bundle

    # No exact combination
    if dp[group_size] == INF:

        return {
            "possible": False,
            "total_bundles": 0,
            "bundles": []
        }

    # Reconstruct optimal bundle combination
    combination = {}

    remaining = group_size

    while remaining > 0:

        bundle = previous_bundle[remaining]

        if bundle is None:
            raise RuntimeError("Booking reconstruction failed.")

        combination[bundle] = combination.get(bundle, 0) + 1

        remaining -= bundle

    bundles = [
        {
            "size": size,
            "quantity": quantity
        }
        for size, quantity in sorted(
            combination.items(),
            reverse=True
        )
    ]

    return {
        "possible": True,
        "total_bundles": dp[group_size],
        "bundles": bundles
    }