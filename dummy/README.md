# Dummy Dose3D

Simple application in C++ for test WebInterface without Dose3D.

1. Tests output to `stdout` and `stderr`.
2. Tests run parameters.
3. Tests output file.
4. Tests kill the process (execution time is randomized between 10s and 100s).

Uses C++ library only. Tested on GCC v12.2.0 (C++17).

Can be compiled by:
```
g++ main.cpp -o dummy
```
