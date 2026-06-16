import { analyzeCode } from '../index';

// ─────────────────────────────────────────────
// Sample code snippets for testing
// ─────────────────────────────────────────────

const TWO_SUM_BRUTE_CPP = `
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};`;

const TWO_SUM_HASH_CPP = `
#include <unordered_map>
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (mp.count(comp)) return {mp[comp], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`;

const BINARY_SEARCH_CPP = `
#include <vector>
using namespace std;
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`;

const FIBONACCI_MEMOIZED_PYTHON = `
from functools import lru_cache

class Solution:
    @lru_cache(maxsize=None)
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        return self.fib(n - 1) + self.fib(n - 2)
`;

const FIBONACCI_EXPONENTIAL_PYTHON = `
class Solution:
    def fib(self, n: int) -> int:
        if n <= 1:
            return n
        return self.fib(n - 1) + self.fib(n - 2)
`;

const BFS_JAVA = `
import java.util.*;
class Solution {
    public int shortestPath(int[][] grid, int[] start, int[] end) {
        Queue<int[]> queue = new LinkedList<>();
        boolean[][] visited = new boolean[grid.length][grid[0].length];
        queue.offer(start);
        visited[start[0]][start[1]] = true;
        int level = 0;
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                int[] curr = queue.poll();
                if (curr[0] == end[0] && curr[1] == end[1]) return level;
                // add neighbors
            }
            level++;
        }
        return -1;
    }
}`;

const SLIDING_WINDOW_CPP = `
#include <unordered_map>
#include <string>
using namespace std;
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> mp;
        int left = 0, right = 0, result = 0;
        while (right < s.size()) {
            mp[s[right]]++;
            while (mp[s[right]] > 1) {
                mp[s[left]]--;
                left++;
            }
            result = max(result, right - left + 1);
            right++;
        }
        return result;
    }
};`;

const DP_PYTHON = `
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i-1] == text2[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        return dp[m][n]
`;

const UNION_FIND_CPP = `
#include <vector>
using namespace std;
class UnionFind {
    vector<int> parent, rank;
public:
    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    void union_sets(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return;
        if (rank[px] < rank[py]) swap(px, py);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
    }
};`;

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('analyzeCode - Approach Detection', () => {
  test('detects Brute Force for nested loops (Two Sum O(n²))', () => {
    const result = analyzeCode(TWO_SUM_BRUTE_CPP, { language: 'cpp' });
    expect(['Brute Force', 'Unknown']).toContain(result.approach);
    expect(result.timeComplexity).toBe('O(n²)');
  });

  test('detects Hashing for optimized Two Sum', () => {
    const result = analyzeCode(TWO_SUM_HASH_CPP, { language: 'cpp' });
    expect(result.approach).toBe('Hashing');
    expect(result.timeComplexity).toBe('O(n)');
    expect(result.optimization).toBe('Optimized');
  });

  test('detects Binary Search', () => {
    const result = analyzeCode(BINARY_SEARCH_CPP, { language: 'cpp' });
    expect(result.approach).toBe('Binary Search');
    expect(result.timeComplexity).toBe('O(log n)');
    expect(result.optimization).toBe('Optimized');
  });

  test('detects Dynamic Programming (memoized fibonacci)', () => {
    const result = analyzeCode(FIBONACCI_MEMOIZED_PYTHON, { language: 'python' });
    expect(result.approach).toBe('Dynamic Programming');
    expect(result.optimization).toBe('Optimized');
  });

  test('detects exponential recursion without memoization', () => {
    const result = analyzeCode(FIBONACCI_EXPONENTIAL_PYTHON, { language: 'python' });
    expect(result.timeComplexity).toBe('O(2^n)');
    expect(result.optimization).not.toBe('Optimized');
  });

  test('detects BFS from queue + visited pattern (Java)', () => {
    const result = analyzeCode(BFS_JAVA, { language: 'java' });
    expect(result.approach).toBe('BFS');
    expect(result.optimization).toBe('Optimized');
  });

  test('detects Sliding Window', () => {
    const result = analyzeCode(SLIDING_WINDOW_CPP, { language: 'cpp' });
    expect(['Sliding Window', 'Hashing']).toContain(result.approach);
    expect(result.timeComplexity).toBe('O(n)');
  });

  test('detects Dynamic Programming (2D DP table)', () => {
    const result = analyzeCode(DP_PYTHON, { language: 'python' });
    expect(result.approach).toBe('Dynamic Programming');
    expect(result.timeComplexity).toBe('O(n²)');
  });

  test('detects Union Find (DSU)', () => {
    const result = analyzeCode(UNION_FIND_CPP, { language: 'cpp' });
    expect(result.approach).toBe('Union Find (DSU)');
    expect(result.optimization).toBe('Optimized');
  });
});

describe('analyzeCode - Language Detection', () => {
  test('auto-detects C++', () => {
    const result = analyzeCode(TWO_SUM_HASH_CPP);
    expect(result.language).toBe('C++');
  });

  test('auto-detects Java', () => {
    const result = analyzeCode(BFS_JAVA);
    expect(result.language).toBe('Java');
  });

  test('auto-detects Python', () => {
    const result = analyzeCode(DP_PYTHON);
    expect(result.language).toBe('Python');
  });
});

describe('analyzeCode - Edge Cases', () => {
  test('returns Unknown for empty code', () => {
    const result = analyzeCode('');
    expect(result.approach).toBe('Unknown');
    expect(result.confidence).toBe(0);
  });

  test('returns Unknown for too short code', () => {
    const result = analyzeCode('int x = 5;');
    expect(result.approach).toBe('Unknown');
  });

  test('includes detail breakdown', () => {
    const result = analyzeCode(TWO_SUM_HASH_CPP, { language: 'cpp' });
    expect(result.details).toBeDefined();
    expect(result.details?.dataStructures).toContain('HashMap');
  });
});
