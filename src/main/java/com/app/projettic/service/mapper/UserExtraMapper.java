package com.app.projettic.service.mapper;


import com.app.projettic.domain.*;
import com.app.projettic.service.dto.UserExtraDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link UserExtra} and its DTO {@link UserExtraDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, EvaluationMapper.class, GroupeMapper.class})
public interface UserExtraMapper extends EntityMapper<UserExtraDTO, UserExtra> {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "evaluation.id", target = "evaluationId")
    @Mapping(source = "groupe.id", target = "groupeId")
    @Mapping(source = "cursus", target = "cursus")
    UserExtraDTO toDto(UserExtra userExtra);

    @Mapping(source = "userId", target = "user")
    @Mapping(target = "groupes", ignore = true)
    @Mapping(target = "removeGroupe", ignore = true)
    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "removeProjet", ignore = true)
    @Mapping(source = "evaluationId", target = "evaluation")
    @Mapping(source = "groupeId", target = "groupe")
    @Mapping(source = "cursus", target = "cursus")
    UserExtra toEntity(UserExtraDTO userExtraDTO);

    default UserExtra fromId(Long id) {
        if (id == null) {
            return null;
        }
        UserExtra userExtra = new UserExtra();
        userExtra.setId(id);
        return userExtra;
    }
}
