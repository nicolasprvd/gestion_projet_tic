package com.app.projettic.service.mapper;


import com.app.projettic.domain.*;
import com.app.projettic.service.dto.GroupeDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Groupe} and its DTO {@link GroupeDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserExtraMapper.class, ProjetMapper.class})
public interface GroupeMapper extends EntityMapper<GroupeDTO, Groupe> {

    @Mapping(source = "userExtra.id", target = "userExtraId")
    @Mapping(source = "projet.id", target = "projetId")
    GroupeDTO toDto(Groupe groupe);

    @Mapping(target = "projets", ignore = true)
    @Mapping(target = "removeProjet", ignore = true)
    @Mapping(target = "userExtras", ignore = true)
    @Mapping(target = "removeUserExtra", ignore = true)
    @Mapping(source = "userExtraId", target = "userExtra")
    @Mapping(source = "projetId", target = "projet")
    @Mapping(source = "actif", target = "actif")
    @Mapping(source = "cursus", target = "cursus")
    Groupe toEntity(GroupeDTO groupeDTO);

    default Groupe fromId(Long id) {
        if (id == null) {
            return null;
        }
        Groupe groupe = new Groupe();
        groupe.setId(id);
        return groupe;
    }
}
