/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║        DSA Code Analyzer — Terminal Demo                  ║
 * ║  Ye script dikhata hai ki analyzer engine kaise kaam      ║
 * ║  karta hai — real DSA code analyze karke result deta hai  ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import { analyzeCode } from './packages/analyzer/dist/index.mjs';

// ─────────────────────────────────────────────
// Helper: Pretty-print results
// ─────────────────────────────────────────────
function printResult(title, result) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  🔍  ${title}`);
  console.log('═'.repeat(60));
  console.log(`  📝 Language       : ${result.language}`);
  console.log(`  🧠 Approach       : ${result.approach}`);
  console.log(`  ⏱️  Time Complexity : ${result.timeComplexity}`);
  console.log(`  💾 Space Complexity: ${result.spaceComplexity}`);
  console.log(`  ✅ Optimization   : ${result.optimization}`);
  console.log(`  📊 Confidence     : ${(result.confidence * 100).toFixed(0)}%`);
  
  if (result.details) {
    console.log('  ─── Details ───');
    if (result.details.loopDepth !== undefined)
      console.log(`  🔄 Loop Depth     : ${result.details.loopDepth}`);
    if (result.details.hasRecursion !== undefined)
      console.log(`  🔁 Has Recursion  : ${result.details.hasRecursion ? 'Yes' : 'No'}`);
    if (result.details.dataStructures?.length)
      console.log(`  🗂️  Data Structures: ${result.details.dataStructures.join(', ')}`);
    if (result.details.patterns?.length) {
      console.log(`  📋 Patterns       :`);
      result.details.patterns.forEach(p => console.log(`     → ${p}`));
    }
  }
  console.log('═'.repeat(60));
}

// ─────────────────────────────────────────────
// Test Cases — Real DSA Problems
// ─────────────────────────────────────────────

// 1️⃣ Two Sum — Hashing approach (C++)
const twoSumCpp = `
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int comp = target - nums[i];
        if (mp.count(comp)) return {mp[comp], i};
        mp[nums[i]] = i;
    }
    return {};
}
`;

// 2️⃣ Binary Search (Python)
const binarySearchPython = `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`;

// 3️⃣ BFS — Level Order Traversal (Java)
const bfsJava = `
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        result.add(level);
    }
    return result;
}
`;

// 4️⃣ Dynamic Programming — 0/1 Knapsack (C++)
const dpKnapsack = `
int knapsack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i-1] <= w)
                dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]]);
            else
                dp[i][w] = dp[i-1][w];
        }
    }
    return dp[n][W];
}
`;

// 5️⃣ Two Pointer — Container With Most Water (JavaScript)
const twoPointerJS = `
function maxArea(height) {
    let left = 0, right = height.length - 1;
    let maxWater = 0;
    while (left < right) {
        const width = right - left;
        const h = Math.min(height[left], height[right]);
        maxWater = Math.max(maxWater, width * h);
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    return maxWater;
}
`;

// 6️⃣ DFS + Backtracking — N-Queens (Python)
const backtrackingPython = `
def solveNQueens(n):
    result = []
    board = [['.' for _ in range(n)] for _ in range(n)]
    
    def is_safe(row, col):
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        i, j = row - 1, col - 1
        while i >= 0 and j >= 0:
            if board[i][j] == 'Q':
                return False
            i -= 1
            j -= 1
        i, j = row - 1, col + 1
        while i >= 0 and j < n:
            if board[i][j] == 'Q':
                return False
            i -= 1
            j += 1
        return True
    
    def backtrack(row):
        if row == n:
            result.append([''.join(r) for r in board])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'
    
    backtrack(0)
    return result
`;

// 7️⃣ Sliding Window — Max Sum Subarray of Size K (Java)
const slidingWindowJava = `
public int maxSumSubarray(int[] arr, int k) {
    int windowSum = 0, maxSum = Integer.MIN_VALUE;
    for (int i = 0; i < arr.length; i++) {
        windowSum += arr[i];
        if (i >= k - 1) {
            maxSum = Math.max(maxSum, windowSum);
            windowSum -= arr[i - k + 1];
        }
    }
    return maxSum;
}
`;

// ─────────────────────────────────────────────
// Run all analyses
// ─────────────────────────────────────────────
console.log('\n');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║         ⚡ DSA Code Analyzer — Live Demo ⚡              ║');
console.log('║   Analyzing 7 real DSA problems from LeetCode/GFG...    ║');
console.log('╚═══════════════════════════════════════════════════════════╝');

const testCases = [
  { title: '1️⃣  Two Sum (C++ — Hashing)', code: twoSumCpp, lang: 'cpp' },
  { title: '2️⃣  Binary Search (Python)', code: binarySearchPython, lang: 'python' },
  { title: '3️⃣  BFS Level Order (Java)', code: bfsJava, lang: 'java' },
  { title: '4️⃣  0/1 Knapsack DP (C++)', code: dpKnapsack, lang: 'cpp' },
  { title: '5️⃣  Two Pointer — Max Water (JavaScript)', code: twoPointerJS, lang: 'javascript' },
  { title: '6️⃣  N-Queens Backtracking (Python)', code: backtrackingPython, lang: 'python' },
  { title: '7️⃣  Sliding Window Max Sum (Java)', code: slidingWindowJava, lang: 'java' },
];

for (const tc of testCases) {
  const result = analyzeCode(tc.code, { language: tc.lang });
  printResult(tc.title, result);
}

console.log('\n✅ All 7 analyses complete! Extension ka core analyzer engine perfectly kaam kar raha hai.\n');
