---
title: Structure of an Agent
description: What is an Agent and how is it structured
hide_table_of_contents: false
sidebar_position: 1
---

# Agent Architecture of an Agent

## Data Structure

### Input

This is the input which the agent is receiving. Usually a snippet of conversation, but could be anything that is being processed by the particular agent.

### Speaker

Who is it that is speaking to the Agent? This helps to store associated data between the speaker and the agent. Could be a user ID, a user name, etc.

### Agent

Name of the agent that is being interacted with.

### Client

What client channel is this interaction occurring on? Web, discord, twitter?

### Channel Id

Represents a unique channel that this interaction may be occurring in.

### Entity

### Output
