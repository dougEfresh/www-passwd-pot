package main

import "net/http"
import "os"

func main() {
	dir, _ := os.Getwd()
	panic(http.ListenAndServe(":8081", http.FileServer(http.Dir(dir))))
}
