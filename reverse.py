#!/usr/bin/env python

class Node:
    def __init__(children, data):
        self.children = children
        self.data = data



def reverseDag(head, parent):
    assert isinstance(head, Node)
    assert isinstance(parent, Node)

    oldChildren = head.children
    oldVisited = head.visited
    head.visited = True
    head.children = [parent]
    if (len(oldChildren) == 0): # Ending node, backtrack
        return [head]
    else:
        if (oldVisited): # Already visited, do not visit again
            return []
        else:
            rv = []
            for child in oldChildren:
                rv.append(reverseDag(child, head))
            return rv


print Node([], 10)
