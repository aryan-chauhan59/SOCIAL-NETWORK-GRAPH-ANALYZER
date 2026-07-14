#!/usr/bin/env python3
import sys
import json
import os
from collections import defaultdict, deque

class SocialGraph:
    def __init__(self):
        # Python Skill: defaultdict for adjacency list
        self.graph = defaultdict(list)
        # Python Skill: set() for O(1) user lookup
        self.users = set()

    def add_user(self, username):
        """Adds a user node to the social network."""
        username = username.strip()
        if not username:
            return False, "Username cannot be empty."
        if username in self.users:
            return False, f"User '{username}' already exists."
        self.users.add(username)
        # Ensure the user exists in the graph dictionary even with no friendships
        if username not in self.graph:
            self.graph[username] = []
        return True, f"User '{username}' successfully added."

    def add_friendship(self, user1, user2):
        """Adds a bidirectional friendship edge between user1 and user2."""
        user1 = user1.strip()
        user2 = user2.strip()
        if user1 == user2:
            return False, "A user cannot be friends with themselves."
        if user1 not in self.users or user2 not in self.users:
            return False, "Both users must exist in the network."
        if user2 in self.graph[user1]:
            return False, f"Friendship between '{user1}' and '{user2}' already exists."
        
        # Bidirectional edge addition
        self.graph[user1].append(user2)
        self.graph[user2].append(user1)
        return True, f"Friendship established between '{user1}' and '{user2}'."

    def delete_user(self, username):
        """Deletes a user node and all their friendships."""
        username = username.strip()
        if username not in self.users:
            return False, f"User '{username}' does not exist."
        
        # Remove from other users' friendship lists
        for friend in list(self.graph[username]):
            if username in self.graph[friend]:
                self.graph[friend].remove(username)
                
        # Delete from graph and users set
        if username in self.graph:
            del self.graph[username]
        self.users.remove(username)
        return True, f"User '{username}' successfully deleted."

    def delete_friendship(self, user1, user2):
        """Deletes the bidirectional friendship edge between user1 and user2."""
        user1 = user1.strip()
        user2 = user2.strip()
        if user1 not in self.users or user2 not in self.users:
            return False, "Both users must exist in the network."
        if user2 not in self.graph[user1] and user1 not in self.graph[user2]:
            return False, f"Friendship between '{user1}' and '{user2}' does not exist."
        
        if user2 in self.graph[user1]:
            self.graph[user1].remove(user2)
        if user1 in self.graph[user2]:
            self.graph[user2].remove(user1)
        return True, f"Friendship between '{user1}' and '{user2}' removed."

    def bfs_shortest_path(self, start, end):
        """
        Finds the shortest friendship path between start and end using BFS.
        Python Skill: collections.deque for BFS queue
        Returns:
            path: list of usernames representing the path, or None if no path exists
            trace: a step-by-step execution trace list for visualization
        """
        start = start.strip()
        end = end.strip()
        if start not in self.users or end not in self.users:
            return None, [{"error": "Start or end user does not exist."}]

        trace = []
        if start == end:
            return [start], [{"step": 0, "curr_node": start, "queue": [start], "visited": [start], "parent": {}, "message": f"Start is the same as End: {start}"}]

        # BFS Setup
        queue = deque([start])
        visited = {start}
        parent = {}
        step = 0

        trace.append({
            "step": step,
            "curr_node": None,
            "queue": list(queue),
            "visited": list(visited),
            "parent": dict(parent),
            "message": f"Initialized BFS queue with start node '{start}'"
        })

        found = False
        while queue:
            step += 1
            curr_node = queue.popleft()
            
            trace.append({
                "step": step,
                "curr_node": curr_node,
                "queue": list(queue),
                "visited": list(visited),
                "parent": dict(parent),
                "message": f"Popped '{curr_node}' from queue. Examining its friends."
            })

            if curr_node == end:
                found = True
                break

            for neighbor in self.graph[curr_node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = curr_node
                    queue.append(neighbor)
                    
                    trace.append({
                        "step": step + 0.5, # Sub-step for visualization
                        "curr_node": curr_node,
                        "queue": list(queue),
                        "visited": list(visited),
                        "parent": dict(parent),
                        "message": f"Discovered unvisited friend '{neighbor}'. Enqueued it and set parent to '{curr_node}'."
                    })
                    if neighbor == end:
                        # Optimization: stop immediately if target found during enqueue
                        found = True
                        break
            if found:
                break

        if found:
            # Reconstruct path
            path = []
            curr = end
            while curr != start:
                path.append(curr)
                curr = parent[curr]
            path.append(start)
            path.reverse()
            
            trace.append({
                "step": step + 1,
                "curr_node": end,
                "queue": list(queue),
                "visited": list(visited),
                "parent": dict(parent),
                "message": f"Shortest path found: {' -> '.join(path)}"
            })
            return path, trace
        else:
            trace.append({
                "step": step + 1,
                "curr_node": None,
                "queue": list(queue),
                "visited": list(visited),
                "parent": dict(parent),
                "message": f"Queue empty. No path exists between '{start}' and '{end}'."
            })
            return None, trace

    def dfs_communities(self):
        """
        Detects connected friend communities using Recursive DFS.
        Python Skill: Recursion and set() for visited tracking.
        Returns:
            communities: list of lists, where each inner list is a community of users
            trace: a step-by-step execution trace list for visualization
        """
        visited = set()
        communities = []
        trace = []
        step_counter = [0] # List wrapper to allow modifying in recursive function

        def dfs_visit(node, current_community, recursion_depth):
            step_counter[0] += 1
            visited.add(node)
            current_community.append(node)
            
            trace.append({
                "step": step_counter[0],
                "curr_node": node,
                "visited": list(visited),
                "current_community": list(current_community),
                "recursion_depth": recursion_depth,
                "message": f"DFS visit '{node}' at depth {recursion_depth}. Added to current community."
            })

            # Check neighbors
            for neighbor in sorted(self.graph[node]): # Sort for deterministic visualization
                if neighbor not in visited:
                    trace.append({
                        "step": step_counter[0] + 0.1,
                        "curr_node": node,
                        "visited": list(visited),
                        "current_community": list(current_community),
                        "recursion_depth": recursion_depth,
                        "message": f"From '{node}', neighbor '{neighbor}' is unvisited. Recursing..."
                    })
                    dfs_visit(neighbor, current_community, recursion_depth + 1)
                    
                    step_counter[0] += 1
                    trace.append({
                        "step": step_counter[0],
                        "curr_node": node,
                        "visited": list(visited),
                        "current_community": list(current_community),
                        "recursion_depth": recursion_depth,
                        "message": f"Returned back to '{node}' from recursion depth {recursion_depth + 1}."
                    })
                else:
                    trace.append({
                        "step": step_counter[0] + 0.2,
                        "curr_node": node,
                        "visited": list(visited),
                        "current_community": list(current_community),
                        "recursion_depth": recursion_depth,
                        "message": f"From '{node}', neighbor '{neighbor}' is already visited."
                    })

        # Run DFS on all unvisited users to find all connected components
        for user in sorted(list(self.users)): # Sort for deterministic communities order
            if user not in visited:
                community = []
                trace.append({
                    "step": step_counter[0] + 1,
                    "curr_node": user,
                    "visited": list(visited),
                    "current_community": [],
                    "recursion_depth": 0,
                    "message": f"Found unvisited node '{user}'. Starting a new community component."
                })
                dfs_visit(user, community, 0)
                communities.append(community)
                trace.append({
                    "step": step_counter[0] + 1,
                    "curr_node": None,
                    "visited": list(visited),
                    "current_community": community,
                    "recursion_depth": 0,
                    "message": f"Community fully detected: {community}"
                })

        return communities, trace

    def degree_centrality(self):
        """
        Calculates the degree centrality of all users and ranks them.
        Formula: degree(u) / (N - 1) if N > 1 else 0
        Python Skill: sorted() + lambda for influencer rankings
        """
        N = len(self.users)
        rankings = []
        for user in self.users:
            degree = len(self.graph[user])
            centrality = degree / (N - 1) if N > 1 else 0.0
            rankings.append({
                "username": user,
                "degree": degree,
                "centrality": round(centrality, 4)
            })
        
        # Sort by centrality (and degree) in descending order, fallback to alphabetical username
        sorted_rankings = sorted(rankings, key=lambda x: (-x["centrality"], -x["degree"], x["username"]))
        return sorted_rankings

    def find_mutual_friends(self, user1, user2):
        """
        Finds common mutual friends between user1 and user2.
        Python Skill: set.intersection()
        """
        user1 = user1.strip()
        user2 = user2.strip()
        if user1 not in self.users or user2 not in self.users:
            return None, "One or both users do not exist."
        
        friends1 = set(self.graph[user1])
        friends2 = set(self.graph[user2])
        
        # Set intersection
        mutual = friends1.intersection(friends2)
        return sorted(list(mutual)), None

    def save_to_json(self, filepath):
        """Saves the social network state to a JSON file."""
        data = {
            "users": list(self.users),
            "graph": dict(self.graph)
        }
        try:
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=4)
            return True, f"Network saved to '{filepath}' successfully."
        except Exception as e:
            return False, f"Failed to save network: {str(e)}"

    def load_from_json(self, filepath):
        """Loads the social network state from a JSON file."""
        if not os.path.exists(filepath):
            return False, f"File '{filepath}' does not exist."
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Reset current network
            self.users = set(data.get("users", []))
            self.graph = defaultdict(list)
            
            # Reconstruct adjacency list
            loaded_graph = data.get("graph", {})
            for user, friends in loaded_graph.items():
                self.graph[user] = list(friends)
                # Ensure all users listed in graph are also in users set
                self.users.add(user)
                for friend in friends:
                    self.users.add(friend)
            
            return True, f"Network loaded from '{filepath}' successfully. Found {len(self.users)} users."
        except Exception as e:
            return False, f"Failed to load network: {str(e)}"


# ==========================================
#              CLI MENU IMPLEMENTATION
# ==========================================
def run_cli_menu(filepath="network.json"):
    graph = SocialGraph()
    # Try to load existing network if available
    if os.path.exists(filepath):
        graph.load_from_json(filepath)
        print(f"[*] Loaded existing network from '{filepath}' ({len(graph.users)} users).")
    else:
        print("[*] Initialized empty social network. Will save to 'network.json'.")

    while True:
        print("\n" + "=" * 45)
        print("      SOCIAL NETWORK ANALYZER (CLI)")
        print("=" * 45)
        print("1. Add User (Node)")
        print("2. Add Friendship (Edge)")
        print("3. Find Shortest Path (BFS)")
        print("4. Detect Friend Communities (DFS)")
        print("5. View Influencer Rankings (Degree Centrality)")
        print("6. Find Mutual Friends (Set Intersection)")
        print("7. Display Social Network Adjacency List")
        print("8. Save Network to JSON")
        print("9. Load Network from JSON")
        print("10. Exit")
        print("=" * 45)
        
        try:
            choice = input("Enter your choice (1-10): ").strip()
        except KeyboardInterrupt:
            print("\nExiting CLI...")
            break

        if choice == "1":
            username = input("Enter username to add: ")
            success, msg = graph.add_user(username)
            print(f"[{'SUCCESS' if success else 'ERROR'}] {msg}")
            if success:
                graph.save_to_json(filepath)

        elif choice == "2":
            user1 = input("Enter first user's name: ")
            user2 = input("Enter second user's name: ")
            success, msg = graph.add_friendship(user1, user2)
            print(f"[{'SUCCESS' if success else 'ERROR'}] {msg}")
            if success:
                graph.save_to_json(filepath)

        elif choice == "3":
            start = input("Enter starting user: ")
            end = input("Enter ending user: ")
            path, trace = graph.bfs_shortest_path(start, end)
            if path:
                print(f"[SUCCESS] Shortest path found: {' -> '.join(path)}")
                print(f"Path length (friendship degrees): {len(path) - 1}")
            else:
                print(f"[INFO] No connection path found between '{start}' and '{end}'.")

        elif choice == "4":
            communities, trace = graph.dfs_communities()
            print(f"\n[INFO] Detected {len(communities)} distinct communities:")
            for idx, community in enumerate(communities, 1):
                print(f"  Community #{idx} (Size {len(community)}): {', '.join(community)}")

        elif choice == "5":
            rankings = graph.degree_centrality()
            if not rankings:
                print("[INFO] Network is empty.")
            else:
                print("\nInfluencer Rankings (Degree Centrality):")
                print("-" * 55)
                print(f"{'Rank':<6}{'Username':<20}{'Friend Count':<15}{'Centrality Score':<15}")
                print("-" * 55)
                for idx, rank in enumerate(rankings, 1):
                    print(f"{idx:<6}{rank['username']:<20}{rank['degree']:<15}{rank['centrality']:<15.4f}")
                print("-" * 55)
                print(f"Top Influencer: '{rankings[0]['username']}' with {rankings[0]['degree']} friends!")

        elif choice == "6":
            user1 = input("Enter first user: ")
            user2 = input("Enter second user: ")
            mutual, err = graph.find_mutual_friends(user1, user2)
            if err:
                print(f"[ERROR] {err}")
            else:
                if mutual:
                    print(f"[SUCCESS] Found {len(mutual)} mutual friends: {', '.join(mutual)}")
                else:
                    print(f"[INFO] No mutual friends found between '{user1}' and '{user2}'.")

        elif choice == "7":
            if not graph.users:
                print("[INFO] Network is empty. No users to display.")
            else:
                print("\nSocial Network Adjacency List:")
                print("-" * 45)
                for user in sorted(list(graph.users)):
                    friends = graph.graph[user]
                    friends_str = ", ".join(friends) if friends else "(No friends yet)"
                    print(f"  {user} -> [{friends_str}]")
                print("-" * 45)

        elif choice == "8":
            success, msg = graph.save_to_json(filepath)
            print(f"[{'SUCCESS' if success else 'ERROR'}] {msg}")

        elif choice == "9":
            success, msg = graph.load_from_json(filepath)
            print(f"[{'SUCCESS' if success else 'ERROR'}] {msg}")

        elif choice == "10":
            print("Thank you for using Social Network Analyzer. Goodbye!")
            break
        else:
            print("[ERROR] Invalid choice. Please enter a number between 1 and 10.")


# ==========================================
#              API RUNNER INTERFACE
# ==========================================
def run_api_mode(args, filepath="network.json"):
    graph = SocialGraph()
    # Auto-load network
    if os.path.exists(filepath):
        graph.load_from_json(filepath)
    
    action = args[1]
    
    if action == "get_graph":
        # Returns current graph data
        print(json.dumps({
            "users": sorted(list(graph.users)),
            "graph": dict(graph.graph)
        }))
    
    elif action == "add_user":
        if len(args) < 3:
            print(json.dumps({"success": False, "message": "Missing username."}))
            return
        username = args[2]
        success, msg = graph.add_user(username)
        if success:
            graph.save_to_json(filepath)
        print(json.dumps({
            "success": success, 
            "message": msg,
            "users": sorted(list(graph.users)),
            "graph": dict(graph.graph)
        }))

    elif action == "add_friendship":
        if len(args) < 4:
            print(json.dumps({"success": False, "message": "Missing usernames for friendship."}))
            return
        user1, user2 = args[2], args[3]
        success, msg = graph.add_friendship(user1, user2)
        if success:
            graph.save_to_json(filepath)
        print(json.dumps({
            "success": success, 
            "message": msg,
            "users": sorted(list(graph.users)),
            "graph": dict(graph.graph)
        }))

    elif action == "delete_user":
        if len(args) < 3:
            print(json.dumps({"success": False, "message": "Missing username."}))
            return
        username = args[2]
        success, msg = graph.delete_user(username)
        if success:
            graph.save_to_json(filepath)
        print(json.dumps({
            "success": success, 
            "message": msg,
            "users": sorted(list(graph.users)),
            "graph": dict(graph.graph)
        }))

    elif action == "delete_friendship":
        if len(args) < 4:
            print(json.dumps({"success": False, "message": "Missing usernames."}))
            return
        user1, user2 = args[2], args[3]
        success, msg = graph.delete_friendship(user1, user2)
        if success:
            graph.save_to_json(filepath)
        print(json.dumps({
            "success": success, 
            "message": msg,
            "users": sorted(list(graph.users)),
            "graph": dict(graph.graph)
        }))

    elif action == "bfs":
        if len(args) < 4:
            print(json.dumps({"success": False, "message": "Missing start or end node."}))
            return
        start, end = args[2], args[3]
        path, trace = graph.bfs_shortest_path(start, end)
        print(json.dumps({
            "success": True if path is not None else False,
            "path": path,
            "trace": trace
        }))

    elif action == "dfs":
        communities, trace = graph.dfs_communities()
        print(json.dumps({
            "success": True,
            "communities": communities,
            "trace": trace
        }))

    elif action == "centrality":
        rankings = graph.degree_centrality()
        print(json.dumps({
            "success": True,
            "rankings": rankings
        }))

    elif action == "mutual":
        if len(args) < 4:
            print(json.dumps({"success": False, "message": "Missing usernames."}))
            return
        user1, user2 = args[2], args[3]
        mutual, err = graph.find_mutual_friends(user1, user2)
        if err:
            print(json.dumps({"success": False, "message": err}))
        else:
            print(json.dumps({
                "success": True,
                "mutual": mutual
            }))
    
    elif action == "reset":
        # Clear database
        graph.users = set()
        graph.graph = defaultdict(list)
        graph.save_to_json(filepath)
        print(json.dumps({
            "success": True,
            "message": "Social network successfully reset.",
            "users": [],
            "graph": {}
        }))

    elif action == "load_preset":
        # Load a default sample social network for demonstration
        graph.users = set()
        graph.graph = defaultdict(list)
        
        preset_users = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"]
        for u in preset_users:
            graph.add_user(u)
            
        friendships = [
            ("Alice", "Bob"),
            ("Alice", "Charlie"),
            ("Bob", "Charlie"),
            ("Charlie", "Diana"),
            ("Diana", "Ethan"),
            ("Ethan", "Fiona"),
            ("Fiona", "Diana"),
            ("George", "Hannah") # Isolated community
        ]
        for u1, u2 in friendships:
            graph.add_friendship(u1, u2)
            
        graph.save_to_json(filepath)
        print(json.dumps({
            "success": True,
            "message": "Sample network preset loaded successfully.",
            "users": sorted(list(graph.users)),
            "graph": dict(graph.graph)
        }))

    else:
        print(json.dumps({"success": False, "message": f"Unknown API action: {action}"}))


if __name__ == "__main__":
    # Check if run with API arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--api":
        # Shift arguments to remove '--api'
        run_api_mode(sys.argv[1:], filepath="network.json")
    elif len(sys.argv) > 1 and sys.argv[1] == "--api-filepath" and len(sys.argv) > 3:
        # e.g. python3 social_graph.py --api-filepath custom.json get_graph
        run_api_mode(sys.argv[3:], filepath=sys.argv[2])
    else:
        # Default interactive CLI mode
        run_cli_menu(filepath="network.json")
