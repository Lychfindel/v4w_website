import ipdb

# FLASK IMPORTS
from flask_restful import Resource, reqparse
from flask import current_app


# INTERNAL IMPORTS
from app.src.libpy.lib_search import find_address_in_db, check_if_is_already_a_coordinate
from app.src.libpy.lib_graph import estimate_path_length_time
from app.src.interface import find_what_needs_to_be_found

from app import custom_errors
from dequa_graph.topology import calculate_path
from dequa_graph.formatting import retrieve_info_from_path_streets
from dequa_graph import weights as dqg_w
from app.src.interface_API import get_current_tide_level, get_suggestions
import traceback

# ERROR_CODES
from app.src.api.constants import (
    DEFAULT_LANGUAGE_CODE,
    UNKNOWN_EXCEPTION, MISSING_PARAMETER, NOT_FOUND, RETURNED_EXCEPTION,
    UNCLEAR_SEARCH, GENERIC_ERROR_CODE
)
from app.src.api import errors as err
# UTILS
from app.src.api.utils import (
    api_response, parse_args,
    permission_required, update_api_counter
)
# Utils for networkx graph
from app.src.api.utils import create_url_from_inputs, set_default_request_variables
# Interface for the api
from app.src import interface_API as iAPI
from app.src.interface_API import check_format_coordinates

class getPathStreet(Resource):
    """
    Api to retrieve the time and the length of the shortest path
    between two coordinates
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('start', type=str, required=True,
                                   help="No starting point provided")
        self.reqparse.add_argument('end', type=str, required=True,
                                   help="No ending point provided")
        self.reqparse.add_argument('stop', type=str, required=False,
                                   action="append", default=None)
        self.reqparse.add_argument('speed', type=float, default=5)
        # self.reqparse.add_argument('mode', type=str,
        #                            choices=["walk", "bridge", "tide"],
        #                            default="walk")
        self.reqparse.add_argument('avoid_bridges', type=bool, default=False)
        self.reqparse.add_argument('avoid_tide', type=bool, default=False)
        self.reqparse.add_argument('tide', type=int, default=None)
        self.reqparse.add_argument('waterbus', type=bool, default=False)
        self.reqparse.add_argument('alternatives', type=bool, default=False)
        self.reqparse.add_argument('language', type=str, default=DEFAULT_LANGUAGE_CODE)
        super(getPathStreet, self).__init__()

    @permission_required
    @update_api_counter
    def get(self):
        args = parse_args(self.reqparse)
        lang = args['language']
        # validate the coordinates
        try:
            start_coords, end_coords = check_format_coordinates(args['start'], args['end'])
            if args['stop']:
                stop_coords = check_format_coordinates(args['stop'])
            else:
                stop_coords = None
        except (err.CoordinatesFormatError, err.CoordinatesNumberError) as e:
            return api_response(code=e.code, lang=lang)
        # call the interface to handle everythin
        try:
            info = iAPI.find_shortest_path_from_coordinates(
                start=start_coords, end=end_coords, stop=stop_coords,
                speed=args['speed'], avoid_bridges=args['avoid_bridges'],
                avoid_tide=args['avoid_tide'], tide=args['tide'],
                waterbus=args['waterbus'], alternatives=args['alternatives']
            )
            return api_response(data=info, lang=lang)
        except Exception as e:
            current_app.logger.error(str(e))
            return api_response(code=getattr(e, 'code', GENERIC_ERROR_CODE), lang=lang)
        # # Define the weight that we will use
        # if args['avoid_tide']:
        #     if not args['tide']:
        #         args['tide'] = get_current_tide_level()
        #     weight = dqg_w.get_weight_tide(
        #                 graph=current_app.graphs['street']['graph'],
        #                 tide_level=args['tide'],
        #                 speed=args['speed'],
        #                 use_weight_bridges=args['avoid_bridges'])
        # elif args['avoid_bridges']:
        #     weight = dqg_w.get_weight_bridges(
        #                 graph=current_app.graphs['street']['graph'],
        #                 speed=args['speed'])
        # else:  # default is walk
        #     weight = dqg_w.get_weight_time(
        #                 graph=current_app.graphs['street']['graph'],
        #                 speed=5)
        # # check the format, maybe we can change it with just a try/except
        # try:
        #     v_list, e_list = calculate_path(
        #                 graph=current_app.graphs['street']['graph'],
        #                 coords_start=[start_coords],
        #                 coords_end=[end_coords],
        #                 coords_stop=stop_coords,
        #                 weight=weight,
        #                 all_vertices=current_app.graphs['street']['all_vertices']
        #                 )
        #
        #     info = retrieve_info_from_path_streets(
        #                 graph=current_app.graphs['street']['graph'],
        #                 paths_vertices=v_list,
        #                 paths_edges=e_list
        #                 )
        #     return api_response(data=info)
        # except Exception:
        #     traceback.print_exc()
        #     return api_response(code=NOT_FOUND, lang=lang)


class getCurrentTide(Resource):
    """
    Api to retrieve the time and the length of the shortest path
    between two coordinates
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('language', type=str, default=DEFAULT_LANGUAGE_CODE)
        super(getCurrentTide, self).__init__()

    @permission_required
    @update_api_counter
    def get(self):
        args = parse_args(self.reqparse)
        lang = args['language']
        # validate the coordinates
        try:
            tide = get_current_tide_level()
            return api_response(data={'tide': tide})
        except Exception:
            return api_response(code=NOT_FOUND, lang=lang)


class getSuggestions(Resource):
    """
    API to retrieve names from the database
    """
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, required=True,
                                   help="No name provided")
        self.reqparse.add_argument('max_num', type=int, default=5)
        self.reqparse.add_argument('language', type=str, default=DEFAULT_LANGUAGE_CODE)
        super(getSuggestions, self).__init__()

    @permission_required
    @update_api_counter
    def get(self):
        try:
            args = self.reqparse.parse_args()
        except Exception as e:
            err_msg = e.data['message']
            all_err = [err_msg[argument] for argument in err_msg.keys()]
            msg = '. '.join(all_err)
            return api_response(code=UNKNOWN_EXCEPTION, message=msg)
        name = args['name']
        max_num = args['max_num']
        lang = args['language']
        try:
            suggestions = get_suggestions(name, max_num)
        except Exception:
            return api_response(code=RETURNED_EXCEPTION, lang=lang)

        return api_response(data=suggestions)
# OLD API

class getAddress(Resource):
    """
    API to retrieve coordinates from an address
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('address', type=str, required=True,
                                   help="No address provided")
        self.reqparse.add_argument('language', type=str, default=DEFAULT_LANGUAGE_CODE)
        super(getAddress, self).__init__()

    @permission_required
    @update_api_counter
    def get(self):
        try:
            args = self.reqparse.parse_args()
        except Exception as e:
            err_msg = e.data['message']
            all_err = [err_msg[argument] for argument in err_msg.keys()]
            msg = '. '.join(all_err)
            return api_response(code=UNKNOWN_EXCEPTION, message=msg)
        address = args['address']
        lang = args['language']
        try:
            result_dict = find_address_in_db(address)
        except Exception:
            return api_response(code=RETURNED_EXCEPTION, lang=lang)
        if len(result_dict) > 1:
            return api_response(code=UNCLEAR_SEARCH, lang=lang)
        data = {'address': result_dict[0]['nome'],
                'longitude': result_dict[0]['coordinate'][0],
                'latitude': result_dict[0]['coordinate'][1]
                }
        return api_response(data=data)


class getPath(Resource):
    """
    Api to retrieve the time and the length of the shortest path
    between two coordinates
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('start', type=str, required=True,
                                   help="No starting point provided")
        self.reqparse.add_argument('end', type=str, required=True,
                                   help="No ending point provided")
        self.reqparse.add_argument('speed', type=float, default=5)
        self.reqparse.add_argument('mode', type=str, default="foot")
        self.reqparse.add_argument('language', type=str, default=DEFAULT_LANGUAGE_CODE)
        super(getPath, self).__init__()

    @permission_required
    @update_api_counter
    def get(self):
        try:
            args = self.reqparse.parse_args()
        except Exception as e:
            err_msg = e.data['message']
            all_err = [err_msg[argument] for argument in err_msg.keys()]
            msg = '. '.join(all_err)
            return api_response(code=UNKNOWN_EXCEPTION, message=msg)
        lang = args['language']
        is_coordinate_start, coords_start = check_if_is_already_a_coordinate(args['start'])
        is_coordinate_end, coords_end = check_if_is_already_a_coordinate(args['end'])
        if not is_coordinate_start or not is_coordinate_end:
            api_response(code=MISSING_PARAMETER, lang=lang)
        default_params = set_default_request_variables()
        user_params = {
            'da': args['start'],
            'a': args['end'],
            'start_coord': args['start'],
            'end_coord': args['end']
        }
        params_research = dict(default_params, **user_params)
        try:
            path = find_what_needs_to_be_found(params_research)
        except custom_errors.UserError:
            url_args = args
            url_args.pop('start')
            dequa_url = create_url_from_inputs(args)
            data = {
                'length': -1,
                'time': -1,
                'url': dequa_url
            }
            return api_response(code=NOT_FOUND, data=data, lang=lang)
        except Exception as e:
            return api_response(code=NOT_FOUND, lang=lang)
        dequa_url = create_url_from_inputs(args)
        data = {
            'length': path['path']['lunghezza'],
            'time': path['path']['time'],
            'url': dequa_url
        }
        return api_response(data=data)


class getMultiplePaths(Resource):
    """
    Api to retrieve, given a multiple starting points and one ending point,
    the estimated time and the length of the shortest paths from each starting
    point to the ending point.
    """

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('start', type=str, required=True,
                                   help="No starting point provided",
                                   action='append')
        self.reqparse.add_argument('end', required=True,
                                   help="No ending point provided")
        self.reqparse.add_argument('speed', type=float, default=5)
        self.reqparse.add_argument('mode', type=str, choices=('walk'), default="walk",
                                    help="Mode {mode} not supported")
        self.reqparse.add_argument('language', type=str, default=DEFAULT_LANGUAGE_CODE)
        super(getMultiplePaths, self).__init__()

    @permission_required
    @update_api_counter
    def get(self):
        try:
            args = self.reqparse.parse_args()
        except Exception as e:
            err_msg = e.data['message']
            all_err = [err_msg[argument] for argument in err_msg.keys()]
            msg = '. '.join(all_err)
            return api_response(code=UNKNOWN_EXCEPTION, message=msg)
        lang = args['language']
        is_coord, end_coords = check_if_is_already_a_coordinate(args['end'])
        if not is_coord:
            return api_response(code=MISSING_PARAMETER, lang=lang)
        # default_params = set_default_request_variables()
        all_length_time = {}
        for start_point in args['start']:
            is_coord, start_coords = check_if_is_already_a_coordinate(start_point)
            if not is_coord:
                return api_response(code=MISSING_PARAMETER, lang=lang)
            all_length_time[start_point] = estimate_path_length_time(start_coords, end_coords,
                    speed=args['speed'])

        return api_response(data=all_length_time)