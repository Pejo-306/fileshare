package com.pesho.fileshare.repositories;

import com.pesho.fileshare.models.User;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Integer> {
}
