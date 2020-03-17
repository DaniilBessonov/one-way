package com.example.saving_routes.algorithm;

import java.util.*;

public class Graph {
    private HashMap<String, Node> nodes;

    public Graph() {
        nodes = new HashMap<String, Node>();
    }

    public HashMap<String, Node> getNodes() {
        return nodes;
    }

    public void setNodes(HashMap<String, Node> nodes) {
        this.nodes = nodes;
    }

    public void addNode(Node newNode) {
        nodes.put(newNode.getId(), newNode);
    }

    public Node getNode(int index) {
        Node res = nodes.get(index);
        return res;
    }

    public Node setNode(int index) {
        Node res = nodes.get(index);
        return res;
    }

    public void allNotVisited(Node startPoint) {
        for (Map.Entry<String, Node> node : nodes.entrySet()) {
            if (!node.getValue().getId().equals(startPoint.getId())) {
                node.getValue().setVisited(false);
            }
        }
    }

    public Long shortestWay(Node startPoint, Node endPoint, LinkedList<Node> resArray) {
        resArray.add(startPoint);
        if (startPoint.getEdges() == null) {
            return startPoint.getEdges().get(0).getDuration();
        }
        Long res = startPoint.getEdges().get(0).getDuration();
        int countPoint = nodes.size();
        int counter = 0;
        if (startPoint.getId().equals(endPoint.getId()) && counter == countPoint - 1) {
            return res;
        } else {
            for (Edge edge : startPoint.getEdges()) {
                if (!edge.getStartNode().isVisited()) {
                    startPoint.setVisited(true);
                    res += shortestWay(edge.getEndNode(), endPoint, resArray);
                    counter++;
                }
            }
        }
        return res;
    }

public LinkedList<Edge> shortGamiltoneWay(Node startPoint,
                                      Node endPoint,
                                      LinkedList<Edge> resArray,
                                      LinkedList<Edge> minResArray,
                                      int counter,
                                      Long curSum,
                                      Long minSum) {
        Edge minEdge;

        startPoint.setVisited(true);
        LinkedList<Edge> usedNeighbors= new LinkedList<Edge>();


        for (Edge edge : startPoint.getEdges()) {
            counter = resArray.size();
            if (counter == nodes.size()-1||usedNeighbors.size()==nodes.size()-1) {
                counter=0;
                curSum=0L;
                allNotVisited(startPoint);
                minResArray.addAll(resArray);
                resArray.clear();
                return minResArray;
            }
            if(counter==0 && usedNeighbors.size()==nodes.size()-1)
            {
                return minResArray;
            }
            if (edge.getEndNode().getId().equals(endPoint.getId()) && counter == nodes.size() - 2) {
                minEdge = edge;
                minEdge.getEndNode().setVisited(true);
                resArray.add(minEdge);
                usedNeighbors.add(edge);
                curSum += minEdge.getDuration();
                if (curSum < minSum) {
                    minResArray.clear();
                    minSum=curSum;
                }
                curSum=Long.valueOf(0);
            } else if (!edge.getEndNode().isVisited() && !usedNeighbors.contains(edge) && !edge.getEndNode().getId().equals(endPoint.getId())) {
                minEdge = edge;
                minEdge.getEndNode().setVisited(true);
                usedNeighbors.add(edge);
                resArray.add(minEdge);
                curSum += minEdge.getDuration();
                if (curSum > minSum) {
                    break;
                }
                System.out.print("A");
                shortGamiltoneWay(minEdge.getEndNode(), endPoint, resArray, minResArray, counter, curSum, minSum);
                System.out.print("A");
            }

        }

        return minResArray;
    }

    public void shortestWay(Node startPoint, Node endPoint, LinkedList<Edge> resArray, int counter, Long curSum) {
        startPoint.setVisited(true);
        Edge minEdge = startPoint.getEdges().get(0);
        if (counter == nodes.size() - 1) {
            return;
        }
        for (Edge edge : startPoint.getEdges()) {
            counter = resArray.size();
            if (edge.getEndNode().getId().equals(endPoint.getId()) && counter == nodes.size() - 2) {
                minEdge = edge;
                minEdge.getEndNode().setVisited(true);
                resArray.add(minEdge);
                curSum += minEdge.getDuration();
            } else if (edge.getDuration() < minEdge.getDuration() && !edge.getEndNode().isVisited()
                    && !edge.getEndNode().getId().equals(endPoint.getId())) {
                minEdge = edge;
                minEdge.getEndNode().setVisited(true);
                resArray.add(minEdge);
                shortestWay(minEdge.getEndNode(), endPoint, resArray, counter, curSum += minEdge.getDuration());
            }
        }
    }

    public ArrayList<Node> combinations(Node startPoint, Node endPoint) {
        ArrayList<Node> res = new ArrayList<Node>();
        res.add(startPoint);
        for (Map.Entry<String, Node> node : nodes.entrySet()) {
            res.add(node.getValue());
        }
        res.add(endPoint);
        Long minDurat = Long.valueOf(0);
        for (int i = 0; i < res.size() - 1; i++) {
            for (Edge edge : res.get(i).getEdges()) {
                if (edge.getEndNode() == res.get(i + 1)) {
                    minDurat += edge.getDuration();
                }
            }
        }
        return res;
    }

    public void burntAlg(Node startNode, Node endNode, LinkedList<Edge> resArray) {
        for (Map.Entry<String, Node> node : nodes.entrySet()) {
            node.getValue();
        }
    }
}
