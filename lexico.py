#!/usr/bin/env python

# Challenge #2

# The idea is to build a transitive closure for the given lexicographic ordering
def getComparatorForOrdering(ordering):
    # Build ordering matrix
    comparatorMatrix = dict()
    numChars = len(ordering)

    for i in range(numChars):
        lchar = ordering[i]
        comparatorMatrix[lchar] = dict()
        for j in range(numChars):
            rchar = ordering[j]
            if i == j:
                comparatorMatrix[lchar][rchar] = 0
            elif i < j:
                comparatorMatrix[lchar][rchar] = -1
            else:
                comparatorMatrix[lchar][rchar] = 1

    # Comparator for characters
    def cmpChars(l, r):

        return comparatorMatrix[l][r]
    
    # Comparator for strings
    def cmpStrings(lstr, rstr):
        assert isinstance(lstr, str)
        assert isinstance(rstr, str)

        # Smoke test for invalid data
        for ch in lstr:
            assert ch in comparatorMatrix, "'" + ch + "' is not in valid chars"
        for ch in rstr:
            assert ch in comparatorMatrix, "'" + ch + "' is not in valid chars"

        llen = len(lstr)
        rlen = len(rstr)

        lenToCheck = llen if (llen < rlen) else rlen
        for i in range(lenToCheck):
            cc = cmpChars(lstr[i], rstr[i])
            if cc != 0:
                return cc

        if llen == rlen:
            return 0
        elif llen < rlen:
            return -1
        else:
            return 1

    return cmpStrings


# Required function
def sortByOrdering(data, ordering):
    # Assert invariants
    assert isinstance(data, list)
    assert isinstance(ordering, str)

    return sorted(data, cmp=getComparatorForOrdering(ordering))


print sortByOrdering(["a", "b", "c"], "abc")
print sortByOrdering(["a", "b", "c"], "bca")
print sortByOrdering(["a", "b", "c"], "cab")
print sortByOrdering(["acb", "abc", "bca"], "abc")
print sortByOrdering(["acb", "abc", "bca"], "bca")
print sortByOrdering(["acb", "abc", "bca"], "cab")
print sortByOrdering(["aaa", "aa", ""], "a")
