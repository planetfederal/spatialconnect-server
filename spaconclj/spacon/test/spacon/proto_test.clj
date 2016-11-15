(ns spacon.proto-test
  (:require [clojure.test :refer :all]
            [spacon.util.protobuf :as pbf]))

(deftest test-protobuf
  (let [pbbytes (.toByteArray (pbf/->protobuf 1 "foo" 2 "goo"))
        messagemap (pbf/bytes->map pbbytes)
        pb (pbf/map->protobuf messagemap)]
    (println pb)
    (is (= "foo" (:replyTo messagemap)))
    (is (= "goo" (:payload messagemap)))
    (is (= (:payload messagemap) (.getPayload pb)))
    (is (= (:replyTo messagemap) (.getReplyTo pb)))))